import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateEstadoDto {
  @IsString()
  @Length(1, 100)
  nombre!: string;
  @IsOptional()
  @IsString()
  descripcion?: string;
  @IsOptional()
  @IsString()
  @Length(0, 20)
  color?: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
  @IsOptional()
  @IsBoolean()
  es_final?: boolean;
}
