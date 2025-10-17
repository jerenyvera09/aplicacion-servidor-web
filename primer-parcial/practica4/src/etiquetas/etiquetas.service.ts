import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Etiqueta } from './entities/etiqueta.entity';
import { CreateEtiquetaDto } from './dto/create-etiqueta.dto';
import { UpdateEtiquetaDto } from './dto/update-etiqueta.dto';

@Injectable()
export class EtiquetasService {
  constructor(
    @InjectRepository(Etiqueta) private readonly repo: Repository<Etiqueta>,
  ) {}

  create(dto: CreateEtiquetaDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  findAll() { return this.repo.find(); }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Etiqueta no encontrada');
    return found;
  }

  async update(id: number, dto: UpdateEtiquetaDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
