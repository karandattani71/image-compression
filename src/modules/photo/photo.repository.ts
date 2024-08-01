import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoRepository {
  constructor(@InjectRepository(Photo) readonly photoRepository: Repository<Photo>) {}
  async addPhoto(photo: Photo): Promise<Photo> {
    return await this.photoRepository.save(photo);
  }

  async getPhotoById(id: number): Promise<Photo> {
    return await this.photoRepository.findOneBy({ id });
  }
}
