import { ICoberturaRepo } from '../repositorios/cobertura.repo';

export class MockCoberturaRepo implements ICoberturaRepo {
  private data = [
    { id: '1', nombre: 'Básica', descripcion: 'Cobertura básica', factorRiesgo: 1.1 },
    { id: '2', nombre: 'Completa', descripcion: 'Cobertura total', factorRiesgo: 1.5 }
  ];
  obtenerTodas() { return this.data; }
  buscarPorId(id: string) { return this.data.find(v => v.id === id) || null; }
}
