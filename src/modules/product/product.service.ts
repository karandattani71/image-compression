import { Injectable } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(readonly productRepository: ProductRepository) {}

  async addProduct(product: Product): Promise<Product> {
    return await this.productRepository.addProduct(product);
  }
}
