import { IsOptional, IsString, Length } from 'class-validator';

export class CreateAreaDto {
  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  responsable?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  ubicacion?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
