import { Module } from '@nestjs/common';
import { CatalogosResolver } from './catalogos.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [CatalogosResolver],
})
export class CatalogosModule {}
