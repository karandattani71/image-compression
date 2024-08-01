import { Injectable, NotFoundException } from '@nestjs/common';
import { PhotoRepository } from './photo.repository';
import { Photo } from './photo.entity';

@Injectable()
export class PhotoService {
  constructor(readonly photoRepository: PhotoRepository) {}

  async addPhoto(photo: Photo): Promise<Photo> {
    return await this.photoRepository.addPhoto(photo);
  }

  async getPhotoById(id: number): Promise<Photo> {
    const photo = await this.photoRepository.getPhotoById(id);
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }
    return photo;
  }
}
