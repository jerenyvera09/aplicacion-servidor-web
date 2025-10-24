import { ReportesResolver } from './reportes.resolver';
import { ServiceHttp } from '../servicios/http.service';

describe('ReportesResolver (unit)', () => {
  const makeMockRest = (): ServiceHttp => {
    return {
      getReportes: jest.fn(() =>
        Promise.resolve([
          {
            id: 1,
            titulo: 'Alumbrado público dañado',
            descripcion: 'poste',
            categoria: { id: 1, nombre: 'Infra' },
            area: { id: 1, nombre: 'Obras' },
            estado: { id: 1, nombre: 'Abierto' },
          },
          {
            id: 2,
            titulo: 'Basura acumulada',
            descripcion: 'recolección',
            categoria: { id: 2, nombre: 'Limpieza' },
            area: { id: 2, nombre: 'Aseo' },
            estado: { id: 2, nombre: 'En Proceso' },
          },
          {
            id: 3,
            titulo: 'Alumbrado intermitente',
            descripcion: 'falla eléctrica',
            categoria: { id: 1, nombre: 'Infra' },
            area: { id: 1, nombre: 'Obras' },
            estado: { id: 1, nombre: 'Abierto' },
          },
        ]),
      ),
      getPromedioPuntuaciones: jest.fn((reporteId: number) =>
        Promise.resolve({
          reporteId,
          promedio: 4,
        }),
      ),
      getUsuarios: jest.fn(() => Promise.resolve([])),
      getCategorias: jest.fn(() => Promise.resolve([])),
      getAreas: jest.fn(() => Promise.resolve([])),
      getEstados: jest.fn(() => Promise.resolve([])),
    } as unknown as ServiceHttp;
  };

  it('filtra por texto y pagina correctamente', async () => {
    const rest: ServiceHttp = makeMockRest();
    const resolver = new ReportesResolver(rest);

    const res = await resolver.reportes(
      { texto: 'alumbrado' },
      { pagina: 1, limite: 1 },
    );

    expect(res.total).toBe(2);
    expect(res.items.length).toBe(1);
    expect(res.items[0].titulo.toLowerCase()).toContain('alumbrado');
  });

  it('retorna promedio de puntuacion del servicio', async () => {
    const rest: ServiceHttp = makeMockRest();
    const resolver = new ReportesResolver(rest);
    const promedio = await resolver.promedioPuntuacionPorReporte(1);
    expect(promedio).toBe(4);
  });
});
