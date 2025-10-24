import { Module } from '@nestjs/common';
import { ReportesResolver } from './reportes.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [ReportesResolver],
})
export class ReportesModule {}
