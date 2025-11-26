import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { GraphqlService } from './graphql.service';
import { VehiculoTransformadoType } from './types/vehiculo-transformado.type';
import { ConductorType } from './types/conductor.type';
import { DetalleSeguroType } from './types/detalle-seguro.type';

@Resolver()
export class GraphqlResolver {
  constructor(private readonly svc: GraphqlService) {}

  @Query(() => [VehiculoTransformadoType], { name: 'vehiculosTransformados' })
  async vehiculosTransformados(): Promise<VehiculoTransformadoType[]> {
    const vehiculos = await this.svc.obtenerVehiculos();
    return vehiculos.map((v: any) => ({
      id: String(v.id ?? ''),
      marca: String(v.marca ?? ''),
      modelo: String(v.modelo ?? ''),
      descripcion: `${v.tipo ?? ''} ${v.marca ?? ''} ${v.modelo ?? ''} (${v.anio ?? ''})`.trim(),
    }));
  }

  @Query(() => [ConductorType], { name: 'conductoresMayores' })
  async conductoresMayores(
    @Args('edadMin', { type: () => Int, nullable: true, defaultValue: 25 }) edadMin: number,
  ): Promise<ConductorType[]> {
    const conductores = await this.svc.obtenerConductores();
    return conductores
      .filter((c: any) => Number(c.edad ?? 0) > edadMin)
      .map((c: any) => ({ id: String(c.id ?? ''), nombre: String(c.nombreCompleto ?? ''), edad: Number(c.edad ?? 0) }));
  }

  @Query(() => DetalleSeguroType, { name: 'detalleSeguro' })
  async detalleSeguro(@Args('idVehiculo') idVehiculo: string): Promise<DetalleSeguroType> {
    const [vehiculo, conductores, coberturas] = await Promise.all([
      this.svc.obtenerVehiculoPorId(idVehiculo),
      this.svc.obtenerConductores(),
      this.svc.obtenerCoberturas(),
    ]);

    const conductor = (conductores && conductores[0]) || null;
    const cobertura = (coberturas && coberturas[0]) || null;

    return {
      vehiculo: vehiculo
        ? `${vehiculo.marca ?? ''} ${vehiculo.modelo ?? ''} (${vehiculo.anio ?? ''})`
        : 'No encontrado',
      conductor: conductor
        ? `${conductor.nombreCompleto ?? ''} (${conductor.edad ?? ''})`
        : 'No disponible',
      cobertura: cobertura
        ? `${cobertura.nombre ?? ''} - Riesgo ${cobertura.factorRiesgo ?? ''}`
        : 'No disponible',
    };
  }
}
