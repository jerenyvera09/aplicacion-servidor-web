import { IsOptional, IsString, Length, IsArray, ArrayUnique, IsInt, Min } from 'class-validator';

export class CreateReporteDto {
  @IsString()
  @Length(1, 150)
  titulo!: string;

  @IsString()
  descripcion!: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  ubicacion?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  prioridad?: string;

  @IsOptional()
  categoriaId?: number;

  @IsOptional()
  areaId?: number;

  @IsOptional()
  estadoId?: number;

  @IsOptional()
  usuarioId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  etiquetasIds?: number[];
}
