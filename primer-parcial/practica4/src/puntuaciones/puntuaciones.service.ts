import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Puntuacion } from './entities/puntuacion.entity';
import { CreatePuntuacionDto } from './dto/create-puntuacion.dto';
import { UpdatePuntuacionDto } from './dto/update-puntuacion.dto';
import { Reporte } from '../reportes/entities/reporte.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class PuntuacionesService {
  constructor(
    @InjectRepository(Puntuacion) private readonly repo: Repository<Puntuacion>,
    @InjectRepository(Reporte) private readonly repRepo: Repository<Reporte>,
    @InjectRepository(Usuario) private readonly userRepo: Repository<Usuario>,
  ) {}

  async create(dto: CreatePuntuacionDto) {
    const reporte = await this.repRepo.findOne({ where: { id: dto.reporteId } });
    if (!reporte) throw new NotFoundException('Reporte no encontrado');
    const entity = this.repo.create({ valor: dto.valor, usuario: dto.usuario, comentario: dto.comentario, reporte });
    if (dto.usuarioId) {
      const user = await this.userRepo.findOne({ where: { id: dto.usuarioId } });
      if (!user) throw new NotFoundException('Usuario no encontrado');
      entity.usuarioRef = user;
    }
    return this.repo.save(entity);
  }

  findAll() { return this.repo.find({ relations: ['reporte'] }); }

  async findOne(id: number) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Puntuación no encontrada');
    return found;
  }

  async update(id: number, dto: UpdatePuntuacionDto) {
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

  async promedioPorReporte(reporteId: number) {
    const raw = await this.repo.createQueryBuilder('p')
      .select('AVG(p.valor)', 'avg')
      .where('p.reporteId = :reporteId', { reporteId })
      .getRawOne<{ avg: string }>();
    const promedio = raw?.avg ? Number.parseFloat(raw.avg) : 0;
    return { reporteId, promedio };
  }
}
