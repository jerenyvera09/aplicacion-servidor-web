export interface ICoberturaRepo {
  obtenerTodas(): any[];
  buscarPorId(id: string): any | null;
}
