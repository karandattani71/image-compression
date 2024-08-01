import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UploadCsvRequestDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}

export class WebhookRequestDto {
  @ApiProperty({ type: 'string' })
  requestId: string;

  @ApiProperty({ type: 'string' })
  webhookEndpoint: string;
}

export class ProcessCSVResponseDto {
  requestId: string;
  success: boolean;
  message: string;
  invalidRecords: string[];

  constructor(requestId: string, success: boolean, message: string, invalidRecords: string[]) {
    this.requestId = requestId;
    this.success = success;
    this.message = message;
    this.invalidRecords = invalidRecords;
  }
}

export class CsvValidationResultDto {
  headersValidated: boolean;
  missingHeaders: string[];
  invalidRecords: any[];

  constructor(headersValidated: boolean, missingHeaders: string[], invalidRecords: any[]) {
    this.headersValidated = headersValidated;
    this.missingHeaders = missingHeaders;
    this.invalidRecords = invalidRecords;
  }
}

export class ProcessRowResultDto {
  serial_no: string;
  product_name: string;
  input_image_urls: string;
  compressed_image_urls: string;

  constructor(serial_no: string, product_name: string, input_image_urls: string, compressed_image_urls: string) {
    this.serial_no = serial_no;
    this.product_name = product_name;
    this.input_image_urls = input_image_urls;
    this.compressed_image_urls = compressed_image_urls;
  }
}

export class ProcessedRecordDto {
  serial_no: string;
  product_name: string;
  input_image_urls: string;
  compressed_image_urls: string;

  constructor(serial_no: string, product_name: string, input_image_urls: string, compressed_image_urls: string) {
    this.serial_no = serial_no;
    this.product_name = product_name;
    this.input_image_urls = input_image_urls;
    this.compressed_image_urls = compressed_image_urls;
  }
}

export class WebhookResponseDto {
  @ApiProperty()
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}
