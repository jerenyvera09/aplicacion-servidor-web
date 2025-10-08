
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Rol } from "../entities/rol.entidad";

export class RolServicio {
  private repo: Repository<Rol>;
  constructor() {
    this.repo = AppDataSource.getRepository(Rol);
  }
  async create(data: Partial<Rol>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Rol>) { await this.repo.update({ id }, data); return this.findOne(id); }
  async remove(id: string) { await this.repo.delete({ id }); }
}
