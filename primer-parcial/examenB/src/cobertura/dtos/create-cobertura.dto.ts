import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCoberturaDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsNumber()
  @IsNotEmpty()
  factorRiesgo!: number;
}
