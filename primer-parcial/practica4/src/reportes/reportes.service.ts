import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Reporte } from './entities/reporte.entity';
import { CreateReporteDto } from './dto/create-reporte.dto';
import { UpdateReporteDto } from './dto/update-reporte.dto';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Area } from '../areas/entities/area.entity';
import { EstadoReporte } from '../estados/entities/estado-reporte.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Etiqueta } from '../etiquetas/entities/etiqueta.entity';

@Injectable()
export class ReportesService {
  constructor(
  @InjectRepository(Reporte) private readonly repo: Repository<Reporte>,
  @InjectRepository(Categoria) private readonly catRepo: Repository<Categoria>,
  @InjectRepository(Area) private readonly areaRepo: Repository<Area>,
  @InjectRepository(EstadoReporte) private readonly estadoRepo: Repository<EstadoReporte>,
  @InjectRepository(Usuario) private readonly userRepo: Repository<Usuario>,
  @InjectRepository(Etiqueta) private readonly etRepo: Repository<Etiqueta>,
  ) {}

  async create(dto: CreateReporteDto) {
    const entity = this.repo.create({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      ubicacion: dto.ubicacion,
      prioridad: dto.prioridad,
    });
    if (dto.categoriaId) {
      const cat = await this.catRepo.findOne({ where: { id: dto.categoriaId } });
      if (!cat) throw new NotFoundException('Categoria no encontrada');
      entity.categoria = cat;
    }
    if (dto.areaId) {
      const area = await this.areaRepo.findOne({ where: { id: dto.areaId } });
      if (!area) throw new NotFoundException('Area no encontrada');
      entity.area = area;
    }
    if (dto.estadoId) {
      const est = await this.estadoRepo.findOne({ where: { id: dto.estadoId } });
      if (!est) throw new NotFoundException('Estado no encontrado');
      entity.estado = est;
    }
    if ((dto as any).usuarioId) {
      const user = await this.userRepo.findOne({ where: { id: (dto as any).usuarioId } });
      if (!user) throw new NotFoundException('Usuario no encontrado');
      entity.usuario = user;
    }
    if ((dto as any).etiquetasIds?.length) {
      const etiquetas = await this.etRepo.find({ where: { id: In((dto as any).etiquetasIds) } });
      entity.etiquetas = etiquetas;
    }
    return await this.repo.save(entity);
  }
  async findAll() { return this.repo.find(); }
  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Reporte no encontrado');
    return found;
  }
  async update(id: number, dto: UpdateReporteDto) {
    const entity = await this.findOne(id);
    Object.assign(entity, dto);
    if (dto.categoriaId) {
      const cat = await this.catRepo.findOne({ where: { id: dto.categoriaId } });
      if (!cat) throw new NotFoundException('Categoria no encontrada');
      entity.categoria = cat;
    }
    if (dto.areaId) {
      const area = await this.areaRepo.findOne({ where: { id: dto.areaId } });
      if (!area) throw new NotFoundException('Area no encontrada');
      entity.area = area;
    }
    if (dto.estadoId) {
      const est = await this.estadoRepo.findOne({ where: { id: dto.estadoId } });
      if (!est) throw new NotFoundException('Estado no encontrado');
      entity.estado = est;
    }
    if ((dto as any).usuarioId) {
      const user = await this.userRepo.findOne({ where: { id: (dto as any).usuarioId } });
      if (!user) throw new NotFoundException('Usuario no encontrado');
      entity.usuario = user;
    }
    if ((dto as any).etiquetasIds) {
      const etiquetas = await this.etRepo.find({ where: { id: In((dto as any).etiquetasIds) } });
      entity.etiquetas = etiquetas;
    }
    return this.repo.save(entity);
  }
  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
