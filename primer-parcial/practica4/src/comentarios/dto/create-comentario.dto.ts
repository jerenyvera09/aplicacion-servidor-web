import { IsInt, IsString, Min, IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class CreateComentarioDto {
  @IsInt()
  @Min(1)
  reporteId!: number;

  @IsString()
  @IsNotEmpty()
  contenido!: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  etiquetasIds?: number[];

  @IsOptional()
  @IsInt()
  @Min(1)
  usuarioId?: number;
}
