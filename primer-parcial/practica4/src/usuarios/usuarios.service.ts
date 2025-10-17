import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Rol } from '../roles/entities/rol.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario) private readonly repo: Repository<Usuario>,
    @InjectRepository(Rol) private readonly rolRepo: Repository<Rol>,
  ) {}

  async create(dto: CreateUsuarioDto) {
    const entity = this.repo.create({
      nombre: dto.nombre,
      email: dto.email,
      contrasenia: dto.contrasenia,
      estado: dto.estado ?? 'activo',
    });
    if (dto.rolId) {
      const rol = await this.rolRepo.findOne({ where: { id: dto.rolId } });
      if (!rol) throw new NotFoundException('Rol no encontrado');
      entity.rol = rol;
    }
    return this.repo.save(entity);
  }
  findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Usuario no encontrado');
    return found;
  }
  async update(id: number, dto: UpdateUsuarioDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    if (dto.rolId) {
      const rol = await this.rolRepo.findOne({ where: { id: dto.rolId } });
      if (!rol) throw new NotFoundException('Rol no encontrado');
      entity.rol = rol;
    }
    return this.repo.save(entity);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
