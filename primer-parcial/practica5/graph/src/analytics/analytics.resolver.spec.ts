import { AnalyticsResolver } from './analytics.resolver';
import { ServiceHttp } from '../servicios/http.service';

describe('AnalyticsResolver (unit)', () => {
  const makeMockRest = (): ServiceHttp => {
    return {
      getReportes: jest.fn(() =>
        Promise.resolve([
          { id: 1, titulo: 'R1', etiquetas: [{ id: 1, nombre: 'E1' }] },
          { id: 2, titulo: 'R2', etiquetas: [{ id: 1, nombre: 'E1' }] },
          { id: 3, titulo: 'R3', etiquetas: [{ id: 2, nombre: 'E2' }] },
        ]),
      ),
      getPuntuaciones: jest.fn(() =>
        Promise.resolve([
          { id: 1, reporteId: 1, valor: 5 },
          { id: 2, reporteId: 1, valor: 3 },
          { id: 3, reporteId: 2, valor: 4 },
        ]),
      ),
      getEtiquetas: jest.fn(() => Promise.resolve([])),
      getUsuarios: jest.fn(() => Promise.resolve([])),
      getComentarios: jest.fn(() => Promise.resolve([])),
      getAreas: jest.fn(() => Promise.resolve([])),
      getCategorias: jest.fn(() => Promise.resolve([])),
      getEstados: jest.fn(() => Promise.resolve([])),
    } as unknown as ServiceHttp;
  };

  it('reportesPorEtiquetaConPromedio ordena por promedio descendente', async () => {
    const rest = makeMockRest();
    const resolver = new AnalyticsResolver(rest);
    const res = await resolver.reportesPorEtiquetaConPromedio(1, undefined);
    expect(res.length).toBe(2);
    // Promedio R1 = 4, R2 = 4 (empate) - mantiene orden de entrada o estable
    expect(res[0].reporte.id).toBe(1);
    expect(res[0].promedioPuntuacion).toBe(4);
  });
});
