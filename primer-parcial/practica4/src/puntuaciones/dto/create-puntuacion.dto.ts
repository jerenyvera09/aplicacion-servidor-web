import { IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';

export class CreatePuntuacionDto {
  @IsInt()
  @Min(1)
  reporteId!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  valor!: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  usuario?: string;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  usuarioId?: number;
}
