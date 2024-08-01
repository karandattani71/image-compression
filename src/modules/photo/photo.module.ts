import { Module } from '@nestjs/common';
import { Photo } from './photo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoService } from './photo.service';
import { PhotoRepository } from './photo.repository';
import { PhotoController } from './photo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  providers: [PhotoService, PhotoRepository],
  exports: [PhotoService],
  controllers: [PhotoController],
})
export class PhotoModule {}
