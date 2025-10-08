
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Area } from "../entities/area.entidad";

export class AreaServicio {
  private repo: Repository<Area>;
  constructor() {
    this.repo = AppDataSource.getRepository(Area);
  }
  async create(data: Partial<Area>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Area>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
