import sharp from 'sharp';
import { PhotoTypeEnum } from '../modules/photo/photo.enum';

export async function compressImageQualityByBufferAndType(buffer: Buffer, imageType: PhotoTypeEnum): Promise<Buffer> {
  if (imageType === PhotoTypeEnum.JPEG) {
    return await sharp(buffer).jpeg({ quality: Number(process.env.COMPRESSED_IMAGE_QUALITY) || 50 }).toBuffer();
  } else if (imageType === PhotoTypeEnum.PNG) {
    return await sharp(buffer).png({ quality: Number(process.env.COMPRESSED_IMAGE_QUALITY) || 50 }).toBuffer();
  }
}
