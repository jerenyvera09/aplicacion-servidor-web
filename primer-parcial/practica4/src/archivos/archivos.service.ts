import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArchivoAdjunto } from './entities/archivo-adjunto.entity';
import { CreateArchivoAdjuntoDto } from './dto/create-archivo-adjunto.dto';
import { UpdateArchivoAdjuntoDto } from './dto/update-archivo-adjunto.dto';
import { Reporte } from '../reportes/entities/reporte.entity';

@Injectable()
export class ArchivosService {
  constructor(
    @InjectRepository(ArchivoAdjunto) private readonly repo: Repository<ArchivoAdjunto>,
    @InjectRepository(Reporte) private readonly repRepo: Repository<Reporte>,
  ) {}

  async create(dto: CreateArchivoAdjuntoDto) {
    const reporte = await this.repRepo.findOne({ where: { id: dto.reporteId } });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    const entity = this.repo.create({
      nombre: dto.nombre,
      ruta: dto.ruta,
      mimeType: dto.mimeType,
      tamanoBytes: dto.tamanoBytes,
      reporte,
    });
    return this.repo.save(entity);
  }

  findAll() { return this.repo.find({ relations: ['reporte'] }); }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Archivo adjunto no encontrado');
    return found;
  }

  async update(id: number, dto: UpdateArchivoAdjuntoDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    if ((dto as any).reporteId) {
      const reporte = await this.repRepo.findOne({ where: { id: (dto as any).reporteId } });
      if (!reporte) throw new NotFoundException('Reporte no encontrado');
      entity.reporte = reporte;
    }
    return this.repo.save(entity);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
