
import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/usuario.entidad";

export class UsuarioServicio {
  private repo: Repository<Usuario>;
  constructor() {
    this.repo = AppDataSource.getRepository(Usuario);
  }
  async create(data: Partial<Usuario>) { return await this.repo.save(this.repo.create(data)); }
  async findAll() { return await this.repo.find(); }
  async findOne(id: string) { return await this.repo.findOne({ where: { id } }); }
  async update(id: string, data: Partial<Usuario>) {
    // Avoid update query across many-to-many relations (TypeORM limitation).
    if (data.etiquetas) {
      const entity = await this.findOne(id);
      if (!entity) return null;
      entity.etiquetas = data.etiquetas as any;
      Object.assign(entity, data);
      return await this.repo.save(entity);
    }
    await this.repo.update({ id }, data);
    return this.findOne(id);
  }
  async remove(id: string) { await this.repo.delete({ id }); }
}
