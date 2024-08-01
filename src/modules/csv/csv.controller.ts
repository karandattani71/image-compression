import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { logger } from '../../loggers/logger.config';
import { UploadCsvRequestDto, WebhookRequestDto } from './csv.dto';
import { CsvService } from './csv.service';

@Controller('csv')
@ApiTags('CSV')
export class CsvController {
  constructor(readonly csvService: CsvService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadCsvRequestDto })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    logger.info(`File ${file.originalname} uploaded`);
    const validationResult = await this.csvService.validateAndProcessCSV(file);
    logger.info(`Request ${validationResult.requestId} processed`);
    return validationResult;
  }

  @Get(':requestId')
  async getStatusOfRequestByRquestId(@Param('requestId') requestId: string) {
    logger.info(`Request ${requestId} status requested`);
    const validationResult = await this.csvService.getStatusOfRequestByRquestId(requestId);
    logger.info(`Request ${requestId} processed`);
    return validationResult;
  }

  @Post('webhook')
  @ApiBody({ type: WebhookRequestDto })
  handleWebhook(@Body() payload: WebhookRequestDto) {
    this.csvService.setWebhookInCache(payload);
    return { message: 'Webhook received successfully' };
  }

  @Post('output-webhook')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadCsvRequestDto })
  async outputWebhook(@UploadedFile() file: Express.Multer.File) {
    logger.info(`File ${file.originalname} uploaded`);
  }
}
