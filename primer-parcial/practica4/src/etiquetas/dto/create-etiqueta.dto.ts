import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEtiquetaDto {
  @IsString()
  @MaxLength(100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;
}
