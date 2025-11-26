import { IConductorRepo } from '../repositorios/conductor.repo';

export class RegistrarConductorUseCase {
  constructor(private repo: IConductorRepo) {}
  ejecutar() {
    return this.repo.obtenerTodos();
  }
}
