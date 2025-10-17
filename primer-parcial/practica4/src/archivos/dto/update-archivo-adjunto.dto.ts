import { PartialType } from '@nestjs/mapped-types';
import { CreateArchivoAdjuntoDto } from './create-archivo-adjunto.dto';

export class UpdateArchivoAdjuntoDto extends PartialType(CreateArchivoAdjuntoDto) {}
