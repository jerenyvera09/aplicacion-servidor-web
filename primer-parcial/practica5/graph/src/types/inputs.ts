import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class PaginacionInput {
  @Field(() => Int, { defaultValue: 1 })
  pagina!: number;

  @Field(() => Int, { defaultValue: 10 })
  limite!: number;
}

@InputType()
export class FiltroReportesInput {
  @Field({ nullable: true }) texto?: string; // busca en titulo/descripcion
  @Field(() => Int, { nullable: true }) categoriaId?: number;
  @Field(() => Int, { nullable: true }) areaId?: number;
  @Field(() => Int, { nullable: true }) estadoId?: number;
}

@InputType()
export class BusquedaAvanzadaInput {
  @Field({ nullable: true }) texto?: string;
  @Field(() => Int, { nullable: true }) categoriaId?: number;
  @Field(() => Int, { nullable: true }) areaId?: number;
  @Field(() => Int, { nullable: true }) estadoId?: number;
  @Field(() => Int, { nullable: true }) etiquetaId?: number;
  @Field(() => Int, { nullable: true }) usuarioId?: number;
}
