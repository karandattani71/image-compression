import { Controller, Get, HttpStatus, NotFoundException, Param, Res } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { logger } from 'src/loggers/logger.config';

@Controller('photo')
@ApiTags('Photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get(':id')
  async getPhoto(@Param('id') id: number, @Res() res: Response) {
    logger.debug(`Photo with id: ${id} requested`);
    try {
      const photo = await this.photoService.getPhotoById(id);
      res.setHeader('Content-Type', photo.mimeType);
      res.send(photo.image);
      logger.debug(`Photo with id: ${id} retrieved`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        logger.error(`Photo with id: ${id} not found: ${error.message}`);
        res.status(HttpStatus.NOT_FOUND).json({ message: error.message });
      } else {
        logger.error(`An error occurred while retrieving the photo: ${error.message}`);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An error occurred while retrieving the photo' });
      }
    }
  }
}
