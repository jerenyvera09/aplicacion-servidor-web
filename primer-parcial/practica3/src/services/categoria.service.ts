
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Categoria } from "../entities/categoria.entidad";

export class CategoriaServicio {
  private repo: Repository<Categoria>;
  constructor() {
    this.repo = AppDataSource.getRepository(Categoria);
  }
  async create(data: Partial<Categoria>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Categoria>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
