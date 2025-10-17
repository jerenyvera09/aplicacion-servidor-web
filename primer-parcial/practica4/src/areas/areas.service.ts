import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(@InjectRepository(Area) private readonly repo: Repository<Area>) {}

  async create(dto: CreateAreaDto) { const e = this.repo.create(dto); return this.repo.save(e); }
  async findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const f = await this.repo.findOne({ where: { id } });
    if (!f) throw new NotFoundException('Area no encontrada');
    return f;
  }
  async update(id: number, dto: UpdateAreaDto) { await this.findOne(id); await this.repo.update({ id }, dto); return this.findOne(id); }
  async remove(id: number) { await this.findOne(id); await this.repo.delete({ id }); }
}
