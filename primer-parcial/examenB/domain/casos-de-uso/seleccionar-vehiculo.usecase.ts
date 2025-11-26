import { IVehiculoRepo } from '../repositorios/vehiculo.repo';

export class SeleccionarVehiculoUseCase {
  constructor(private repo: IVehiculoRepo) {}
  ejecutar(id: string) {
    return this.repo.buscarPorId(id);
  }
}
