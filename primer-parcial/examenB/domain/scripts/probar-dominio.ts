import { DomainModule } from '../domain.module';
import { GenerarCotizacionUseCase } from '../casos-de-uso/generar-cotizacion.usecase';

// Prueba mínima del flujo de dominio (sin web, sin REST)
const dm = new DomainModule();

const listadoConductores = dm.registrarConductorUC.ejecutar();
const vehiculo = dm.seleccionarVehiculoUC.ejecutar('1');
const cobertura = dm.seleccionarCoberturaUC.ejecutar('2');

const conductorId = listadoConductores[0]?.id;
if (conductorId && vehiculo?.id && cobertura?.id) {
  const generar = new GenerarCotizacionUseCase(dm.conductorRepo, dm.vehiculoRepo, dm.coberturaRepo);
  const resultado = generar.ejecutar(conductorId, vehiculo.id, cobertura.id);
  console.log('Resultado de cotización:', resultado);
} else {
  console.log('Datos insuficientes para generar la cotización.');
}
