import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCoberturaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  factorRiesgo?: number;
}
