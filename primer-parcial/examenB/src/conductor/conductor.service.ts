import { Injectable } from '@nestjs/common';
import { MockConductorRepo } from '../../domain/mocks/mock-conductor.repo';

@Injectable()
export class ConductorService {
  private readonly repo = new MockConductorRepo();

  create(dto: any) {
    const nuevo = { ...dto, id: String(Date.now()) };
    // @ts-ignore
    (this.repo as any).data.push(nuevo);
    return nuevo;
  }

  findAll() { return this.repo.obtenerTodos(); }
  findOne(id: string) { return this.repo.buscarPorId(id); }

  update(id: string, dto: any) {
    // @ts-ignore
    const data = (this.repo as any).data as any[];
    const idx = data.findIndex(v => v.id === id);
    if (idx === -1) return null;
    data[idx] = { ...data[idx], ...dto, id };
    return data[idx];
  }

  remove(id: string) {
    // @ts-ignore
    const data = (this.repo as any).data as any[];
    const idx = data.findIndex(v => v.id === id);
    if (idx === -1) return false;
    data.splice(idx, 1);
    return true;
  }
}
