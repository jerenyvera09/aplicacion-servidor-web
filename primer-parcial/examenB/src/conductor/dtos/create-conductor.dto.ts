import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateConductorDto {
  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @IsInt()
  @IsNotEmpty()
  edad!: number;

  @IsString()
  @IsNotEmpty()
  tipoLicencia!: string;
}
