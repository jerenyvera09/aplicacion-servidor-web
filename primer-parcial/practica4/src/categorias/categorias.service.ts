import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly repo: Repository<Categoria>,
  ) {}

  async create(dto: CreateCategoriaDto) {
    const entity = this.repo.create(dto);
    return await this.repo.save(entity);
  }
  async findAll() {
    return await this.repo.find();
  }
  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Categoria no encontrada');
    return found;
  }
  async update(id: number, dto: UpdateCategoriaDto) {
    await this.findOne(id);
    await this.repo.update({ id }, dto);
    return this.findOne(id);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
