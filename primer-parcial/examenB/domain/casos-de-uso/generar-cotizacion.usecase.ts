import { IConductorRepo } from '../repositorios/conductor.repo';
import { IVehiculoRepo } from '../repositorios/vehiculo.repo';
import { ICoberturaRepo } from '../repositorios/cobertura.repo';

type ResultadoCotizacion = {
  conductor: any;
  vehiculo: any;
  cobertura: any;
  precioEstimado: number;
};

export class GenerarCotizacionUseCase {
  constructor(
    private conductorRepo: IConductorRepo,
    private vehiculoRepo: IVehiculoRepo,
    private coberturaRepo: ICoberturaRepo,
  ) {}

  ejecutar(conductorId: string, vehiculoId: string, coberturaId: string): ResultadoCotizacion | null {
    const conductor = this.conductorRepo.buscarPorId(conductorId);
    const vehiculo = this.vehiculoRepo.buscarPorId(vehiculoId);
    const cobertura = this.coberturaRepo.buscarPorId(coberturaId);

    if (!conductor || !vehiculo || !cobertura) return null;

    // Regla simple de estimación basada en factor de riesgo y año del vehículo
    const base = 500;
    const antiguedad = Math.max(0, new Date().getFullYear() - (vehiculo.anio || new Date().getFullYear()));
    const precioEstimado = Math.round(base * (1 + antiguedad * 0.02) * (cobertura.factorRiesgo || 1) * 100) / 100;

    return { conductor, vehiculo, cobertura, precioEstimado };
  }
}
