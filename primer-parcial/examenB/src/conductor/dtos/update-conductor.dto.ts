import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateConductorDto {
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsInt()
  @IsOptional()
  edad?: number;

  @IsString()
  @IsOptional()
  tipoLicencia?: string;
}
