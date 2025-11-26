import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehiculoTransformadoType {
  @Field(() => ID)
  id!: string;

  @Field()
  marca!: string;

  @Field()
  modelo!: string;

  @Field()
  descripcion!: string;
}
