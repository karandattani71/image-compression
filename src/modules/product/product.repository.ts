import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductRepository {
  constructor(@InjectRepository(Product) readonly productRepository: Repository<Product>) {}

  async addProduct(product: Product): Promise<Product> {
    return await this.productRepository.save(product);
  }
}
