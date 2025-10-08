
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Puntuacion } from "../entities/puntuacion.entidad";

export class PuntuacionServicio {
  private repo: Repository<Puntuacion>;
  constructor() {
    this.repo = AppDataSource.getRepository(Puntuacion);
  }
  async create(data: Partial<Puntuacion>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Puntuacion>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
