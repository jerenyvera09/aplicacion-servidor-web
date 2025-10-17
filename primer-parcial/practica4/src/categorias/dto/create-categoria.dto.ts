import { IsOptional, IsString, Length } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @Length(0, 50)
  prioridad?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  estado?: string;
}
