import { MockConductorRepo } from './mocks/mock-conductor.repo';
import { MockVehiculoRepo } from './mocks/mock-vehiculo.repo';
import { MockCoberturaRepo } from './mocks/mock-cobertura.repo';
import { RegistrarConductorUseCase } from './casos-de-uso/registrar-conductor.usecase';
import { SeleccionarVehiculoUseCase } from './casos-de-uso/seleccionar-vehiculo.usecase';
import { SeleccionarCoberturaUseCase } from './casos-de-uso/seleccionar-cobertura.usecase';

// Módulo de dominio mínimo (sin NestJS) que orquesta dependencias
export class DomainModule {
  readonly conductorRepo = new MockConductorRepo();
  readonly vehiculoRepo = new MockVehiculoRepo();
  readonly coberturaRepo = new MockCoberturaRepo();

  readonly registrarConductorUC = new RegistrarConductorUseCase(this.conductorRepo);
  readonly seleccionarVehiculoUC = new SeleccionarVehiculoUseCase(this.vehiculoRepo);
  readonly seleccionarCoberturaUC = new SeleccionarCoberturaUseCase(this.coberturaRepo);
}
