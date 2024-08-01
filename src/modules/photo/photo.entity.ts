import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../product/product.entity';
import { PhotoTypeEnum } from './photo.enum';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bytea' })
  image: Buffer;

  @Column({ name: 'mime_type', enum: PhotoTypeEnum })
  mimeType: PhotoTypeEnum;

  @ManyToOne(() => Product, (product) => product.photos)
  product: Product;
}
