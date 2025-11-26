import { IVehiculoRepo } from '../repositorios/vehiculo.repo';

export class MockVehiculoRepo implements IVehiculoRepo {
  private data = [
    { id: '1', tipo: 'Auto', marca: 'Toyota', modelo: 'Corolla', anio: 2020 },
    { id: '2', tipo: 'Moto', marca: 'Honda', modelo: 'CBR', anio: 2021 }
  ];

  obtenerTodos() { return this.data; }
  buscarPorId(id: string) { return this.data.find(v => v.id === id) || null; }
}
