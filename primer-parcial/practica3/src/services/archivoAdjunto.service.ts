
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { ArchivoAdjunto } from "../entities/archivoAdjunto.entidad";

export class ArchivoAdjuntoServicio {
  private repo: Repository<ArchivoAdjunto>;
  constructor() {
    this.repo = AppDataSource.getRepository(ArchivoAdjunto);
  }
  async create(data: Partial<ArchivoAdjunto>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<ArchivoAdjunto>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
