import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(@InjectRepository(Rol) private readonly repo: Repository<Rol>) {}

  create(dto: CreateRolDto) { return this.repo.save(this.repo.create(dto)); }
  findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Rol no encontrado');
    return r;
  }
  async update(id: number, dto: UpdateRolDto) {
    const r = await this.findOne(id);
    Object.assign(r, dto);
    return this.repo.save(r);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
