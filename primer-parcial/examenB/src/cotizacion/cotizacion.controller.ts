import { Controller, Get, Query } from '@nestjs/common';
import { MockConductorRepo } from '../../domain/mocks/mock-conductor.repo';
import { MockVehiculoRepo } from '../../domain/mocks/mock-vehiculo.repo';
import { MockCoberturaRepo } from '../../domain/mocks/mock-cobertura.repo';

@Controller('cotizacion')
export class CotizacionController {
  private conductorRepo = new MockConductorRepo();
  private vehiculoRepo = new MockVehiculoRepo();
  private coberturaRepo = new MockCoberturaRepo();

  @Get('estimar')
  estimar(
    @Query('vehiculoId') vehiculoId: string,
    @Query('coberturaId') coberturaId: string,
    @Query('conductorId') conductorId: string,
  ) {
    const conductor = this.conductorRepo.buscarPorId(conductorId);
    const vehiculo = this.vehiculoRepo.buscarPorId(vehiculoId);
    const cobertura = this.coberturaRepo.buscarPorId(coberturaId);
    if (!conductor || !vehiculo || !cobertura) {
      return { ok: false, message: 'Datos no encontrados' };
    }
    const base = 500;
    const antiguedad = Math.max(0, new Date().getFullYear() - (vehiculo.anio || new Date().getFullYear()));
    const precioEstimado = Math.round(base * (1 + antiguedad * 0.02) * (cobertura.factorRiesgo || 1) * 100) / 100;
    return { ok: true, conductor, vehiculo, cobertura, precioEstimado };
  }
}
