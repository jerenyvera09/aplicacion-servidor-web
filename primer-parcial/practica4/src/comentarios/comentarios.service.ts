import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Comentario } from './entities/comentario.entity';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { Reporte } from '../reportes/entities/reporte.entity';
import { Etiqueta } from '../etiquetas/entities/etiqueta.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectRepository(Comentario) private readonly repo: Repository<Comentario>,
    @InjectRepository(Reporte) private readonly repRepo: Repository<Reporte>,
    @InjectRepository(Etiqueta) private readonly etRepo: Repository<Etiqueta>,
    @InjectRepository(Usuario) private readonly userRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreateComentarioDto) {
    const reporte = await this.repRepo.findOne({ where: { id: dto.reporteId } });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    const entity = this.repo.create({ contenido: dto.contenido, reporte });
    if (dto.usuarioId) {
      const user = await this.userRepo.findOne({ where: { id: dto.usuarioId } });
      if (!user) throw new NotFoundException('Usuario no encontrado');
      entity.usuario = user;
    }
    if (dto.etiquetasIds?.length) {
      const etiquetas = await this.etRepo.find({ where: { id: In(dto.etiquetasIds) } });
      entity.etiquetas = etiquetas;
    }
    return this.repo.save(entity);
  }
  async findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Comentario no encontrado');
    return found;
  }
  async update(id: number, dto: UpdateComentarioDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, { contenido: dto.contenido });
    if (dto.etiquetasIds) {
      const etiquetas = await this.etRepo.find({ where: { id: In(dto.etiquetasIds) } });
      entity.etiquetas = etiquetas;
    }
    return this.repo.save(entity);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
