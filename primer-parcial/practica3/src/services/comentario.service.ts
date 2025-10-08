
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Comentario } from "../entities/comentario.entidad";

export class ComentarioServicio {
  private repo: Repository<Comentario>;
  constructor() {
    this.repo = AppDataSource.getRepository(Comentario);
  }
  async create(data: Partial<Comentario>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Comentario>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
