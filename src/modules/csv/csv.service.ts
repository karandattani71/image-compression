import { BadRequestException, Injectable } from '@nestjs/common';
import { parse, format } from 'fast-csv';
import { Readable, Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../loggers/logger.config';
import { Photo } from '../photo/photo.entity';
import { PhotoService } from '../photo/photo.service';
import { Product } from '../product/product.entity';
import { ProductService } from '../product/product.service';
import * as fs from 'fs';
import * as path from 'path';
import { CsvValidationResultDto, ProcessCSVResponseDto, ProcessedRecordDto, ProcessRowResultDto, WebhookRequestDto } from './csv.dto';
import axios from 'axios';
import FormData from 'form-data';
import { PhotoTypeEnum } from '../photo/photo.enum';
import { compressImageQualityByBufferAndType } from '../../utils/image.utils';

@Injectable()
export class CsvService {
  requestProgressStatusMap = new Map<string, any>();
  requestIdToWebhookUrlMap = new Map<string, string>();

  constructor(
    readonly photoService: PhotoService,
    readonly productService: ProductService,
  ) {}

  async validateCSV(csvData: string, requiredHeaders: string[]): Promise<CsvValidationResultDto> {
    let headersValidated = false;
    let missingHeaders: string[] = [];
    const invalidRecords: any[] = [];

    const parseStream = Readable.from(csvData).pipe(parse({ headers: true }));

    parseStream.on('headers', (headers: string[]) => {
      missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
      headersValidated = missingHeaders.length === 0;
    });

    for await (const row of parseStream) {
      if (!headersValidated || !this.isValidRecord(row)) {
        invalidRecords.push(row);
      }
    }

    return new CsvValidationResultDto(headersValidated, missingHeaders, invalidRecords);
  }

  async validateAndProcessCSV(file: Express.Multer.File): Promise<ProcessCSVResponseDto> {
    logger.info(`File ${file.originalname} uploaded`);
    const requestId: string = uuidv4();

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('Invalid file type');
    }

    const csvData = file.buffer.toString();
    const requiredHeaders = ['serial_no', 'product_name', 'input_image_urls'];

    const { headersValidated, missingHeaders, invalidRecords } = await this.validateCSV(csvData, requiredHeaders);

    if (headersValidated && invalidRecords.length === 0) {
      this.requestProgressStatusMap.set(requestId, { status: 'PROCESSING' });
      this.processCSV(requestId, csvData);

      return new ProcessCSVResponseDto(requestId, true, 'CSV validated and process has been started successfully', invalidRecords);
    } else {
      const message = headersValidated ? 'Invalid records found' : `Missing headers: ${missingHeaders.join(', ')}`;

      return new ProcessCSVResponseDto(requestId, false, message, invalidRecords);
    }
  }

  isValidRecord(record: any): boolean {
    const { serial_no, product_name, input_image_urls } = record;
    if (!serial_no || !product_name || !input_image_urls) {
      return false;
    }

    const urls = input_image_urls.split(',');
    return urls.every((url: string) => this.isValidURL(url));
  }

  isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async processCSV(requestId: string, csvData: string): Promise<void> {
    try {
      await this.sleep(30000);
      const processedRecords: ProcessedRecordDto[] = [];
      const parseStream = Readable.from(csvData).pipe(parse({ headers: true }));

      for await (const row of parseStream) {
        const processedRow = await this.processRow(row);
        processedRecords.push(processedRow);
      }
      this.requestProgressStatusMap.set(requestId, { status: 'PROCESSED', processedRecords });
      await this.generateOutputCSV(requestId, processedRecords);

      // Trigger the webhook after processing
    } catch (error) {
      this.requestProgressStatusMap.set(requestId, { status: 'ERROR', error });
    }
  }
  async processRow(row: any): Promise<ProcessRowResultDto> {
    const { serial_no, product_name, input_image_urls } = row;
    const urls = input_image_urls.split(',');

    const compressedPhotos: Photo[] = await Promise.all(
      urls.map(async (url: string) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image from URL: ${url}`);
        }
        const mimeType = response.headers.get('Content-Type') as PhotoTypeEnum;
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const compressedBuffer = await compressImageQualityByBufferAndType(buffer, mimeType);

        const photo = new Photo();
        photo.image = compressedBuffer;
        photo.mimeType = mimeType;
        return await this.photoService.addPhoto(photo);
      }),
    );

    const product = new Product();
    product.name = product_name;
    product.photos = compressedPhotos;

    await this.productService.addProduct(product);

    return new ProcessRowResultDto(
      serial_no,
      product_name,
      input_image_urls,
      compressedPhotos.map((photo) => `http://localhost:3001/api/v1/photo/${photo.id}`).join(','),
    );
  }

  async getStatusOfRequestByRquestId(requestId: string) {
    logger.info(`Request ${requestId} status requested`);
    const validationResult = this.requestProgressStatusMap.get(requestId);
    logger.info(`Request ${requestId} processed`);
    return validationResult;
  }

  async generateOutputCSV(requestId: string, processedRecords: ProcessedRecordDto[]): Promise<void> {
    logger.debug(`Generating output CSV for request ${requestId}`);
    const outputFilePath = path.join(__dirname, `../../output_${requestId}.csv`);
    const outputStream = fs.createWriteStream(outputFilePath);

    const csvStream = format({ headers: true });
    csvStream.pipe(outputStream);

    processedRecords.forEach((record) => {
      const { serial_no, product_name, input_image_urls, compressed_image_urls } = record;

      csvStream.write({
        'Serial Number': serial_no,
        'Product Name': product_name,
        'Input Image Urls': input_image_urls,
        'Output Image Urls': compressed_image_urls,
      });
    });

    csvStream.end();

    await this.triggerWebhook(requestId, outputFilePath);

    logger.debug(`Output CSV generated at: ${outputFilePath}`);
  }

  async triggerWebhook(requestId: string, csvData: any) {
    try {
      logger.debug('Triggering webhook');
      const webhookUrl = this.requestIdToWebhookUrlMap.get(requestId); // Ensure you have this URL in your environment variables
      if (!webhookUrl) {
        throw new Error('Webhook URL is not configured');
      }

      const form = new FormData();
      form.append('file', csvData, 'compressed-images.csv');

      await axios.post(webhookUrl, form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      logger.debug('Webhook triggered successfully');
    } catch (error) {
      logger.error('Failed to trigger webhook', error);
    }
  }

  setWebhookInCache(payload: WebhookRequestDto) {
    this.requestIdToWebhookUrlMap.set(payload.requestId, payload.webhookEndpoint);
  }

  async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
