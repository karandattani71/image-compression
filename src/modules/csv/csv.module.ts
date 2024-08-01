import { Module } from '@nestjs/common';
import { CsvService } from './csv.service';
import { CsvController } from './csv.controller';
import { PhotoModule } from '../photo/photo.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [PhotoModule, ProductModule],
  providers: [CsvService],
  controllers: [CsvController],
  exports: [CsvService],
})
export class CsvModule {}
