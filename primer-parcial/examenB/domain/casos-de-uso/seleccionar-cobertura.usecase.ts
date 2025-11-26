import { ICoberturaRepo } from '../repositorios/cobertura.repo';

export class SeleccionarCoberturaUseCase {
  constructor(private repo: ICoberturaRepo) {}
  ejecutar(id: string) {
    return this.repo.buscarPorId(id);
  }
}
