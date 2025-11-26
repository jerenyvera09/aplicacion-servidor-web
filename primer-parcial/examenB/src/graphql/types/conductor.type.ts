import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConductorType {
  @Field(() => ID)
  id!: string;

  @Field()
  nombre!: string;

  @Field(() => Int)
  edad!: number;
}
