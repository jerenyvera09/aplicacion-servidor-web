export interface IConductorRepo {
  obtenerTodos(): any[];
  buscarPorId(id: string): any | null;
}
