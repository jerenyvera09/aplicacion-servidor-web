import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  @IsNotEmpty()
  tipo!: string;

  @IsString()
  @IsNotEmpty()
  marca!: string;

  @IsString()
  @IsNotEmpty()
  modelo!: string;

  @IsInt()
  @IsNotEmpty()
  anio!: number;
}
