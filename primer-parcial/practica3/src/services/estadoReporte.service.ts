
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { EstadoReporte } from "../entities/estadoReporte.entidad";

export class EstadoReporteServicio {
  private repo: Repository<EstadoReporte>;
  constructor() {
    this.repo = AppDataSource.getRepository(EstadoReporte);
  }
  async create(data: Partial<EstadoReporte>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<EstadoReporte>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
