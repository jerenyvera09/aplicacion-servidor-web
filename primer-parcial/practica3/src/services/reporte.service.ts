
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Reporte } from "../entities/reporte.entidad";

export class ReporteServicio {
  private repo: Repository<Reporte>;
  constructor() {
    this.repo = AppDataSource.getRepository(Reporte);
  }
  async create(data: Partial<Reporte>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Reporte>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
