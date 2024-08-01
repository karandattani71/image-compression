import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { logger } from '../../loggers/logger.config';
import { UploadCsvRequestDto, WebhookRequestDto, WebhookResponseDto } from './csv.dto';
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
    logger.debug(`[CsvController] - File with name ${file.originalname} uploaded`);
    const validationResult = await this.csvService.validateAndProcessCSV(file);
    logger.debug(`[CsvController] - File with name ${file.originalname} processed`);
    return validationResult;
  }

  @Get(':requestId')
  async getStatusOfRequestByRquestId(@Param('requestId') requestId: string) {
    logger.debug(`[CsvController] - Status of request with id ${requestId} requested`);
    const validationResult = await this.csvService.getStatusOfRequestByRquestId(requestId);
    logger.debug(`[CsvController] - Status of request with id ${requestId} processed`);
    return validationResult;
  }

  @Post('webhook')
  @ApiBody({ type: WebhookRequestDto })
  handleWebhook(@Body() payload: WebhookRequestDto): WebhookResponseDto {
    logger.debug(`Webhook receive for request ${payload.requestId}`);
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
