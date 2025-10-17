import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoReporte } from './entities/estado-reporte.entity';
import { CreateEstadoDto } from './dto/create-estado.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';

@Injectable()
export class EstadosService {
  constructor(@InjectRepository(EstadoReporte) private readonly repo: Repository<EstadoReporte>) {}

  async create(dto: CreateEstadoDto) { const e = this.repo.create(dto); return this.repo.save(e); }
  async findAll() { return this.repo.find(); }
  async findOne(id: number) { const f = await this.repo.findOne({ where: { id } }); if (!f) throw new NotFoundException('Estado no encontrado'); return f; }
  async update(id: number, dto: UpdateEstadoDto) { await this.findOne(id); await this.repo.update({ id }, dto); return this.findOne(id); }
  async remove(id: number) { await this.findOne(id); await this.repo.delete({ id }); }
}
