import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ServiceHttp } from './http.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.REST_BASE_URL ?? 'http://localhost:3000/api/v1',
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ServiceHttp],
  exports: [ServiceHttp],
})
export class RestModule {}
