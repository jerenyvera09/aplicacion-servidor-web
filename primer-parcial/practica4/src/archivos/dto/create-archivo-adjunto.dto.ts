import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateArchivoAdjuntoDto {
  @IsInt()
  @Min(1)
  reporteId!: number;

  @IsString()
  @MaxLength(200)
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @MaxLength(500)
  @IsNotEmpty()
  ruta!: string; // permitir URLs o rutas locales

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @IsOptional()
  @IsInt()
  tamanoBytes?: number;
}
