import { PartialType } from '@nestjs/mapped-types';
import { CreatePuntuacionDto } from './create-puntuacion.dto';

export class UpdatePuntuacionDto extends PartialType(CreatePuntuacionDto) {}
