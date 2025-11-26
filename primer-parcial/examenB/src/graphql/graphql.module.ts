import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GraphqlResolver } from './graphql.resolver';
import { GraphqlService } from './graphql.service';

@Module({
  imports: [HttpModule],
  providers: [GraphqlResolver, GraphqlService],
})
export class GraphqlModule {}
