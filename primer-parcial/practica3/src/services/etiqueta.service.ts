
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Etiqueta } from "../entities/etiqueta.entidad";

export class EtiquetaServicio {
  private repo: Repository<Etiqueta>;
  constructor() {
    this.repo = AppDataSource.getRepository(Etiqueta);
  }
  async create(data: Partial<Etiqueta>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Etiqueta>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
