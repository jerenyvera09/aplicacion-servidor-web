export interface IVehiculoRepo {
  obtenerTodos(): any[];
  buscarPorId(id: string): any | null;
}
