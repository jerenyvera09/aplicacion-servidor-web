import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateVehiculoDto {
  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsInt()
  @IsOptional()
  anio?: number;
}
