import { Module } from '@nestjs/common';
import { AnalyticsResolver } from './analytics.resolver';
import { RestModule } from '../servicios/rest.module';

@Module({
  imports: [RestModule],
  providers: [AnalyticsResolver],
})
export class AnalyticsModule {}
