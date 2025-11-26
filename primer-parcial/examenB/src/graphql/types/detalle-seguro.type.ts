import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DetalleSeguroType {
  @Field()
  vehiculo!: string;

  @Field()
  conductor!: string;

  @Field()
  cobertura!: string;
}
