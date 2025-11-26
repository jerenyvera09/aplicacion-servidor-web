import { IConductorRepo } from '../repositorios/conductor.repo';

export class MockConductorRepo implements IConductorRepo {
  private data = [
    { id: '1', nombreCompleto: 'Juan Pérez', edad: 30, tipoLicencia: 'B' }
  ];
  obtenerTodos() { return this.data; }
  buscarPorId(id: string) { return this.data.find(v => v.id === id) || null; }
}
