import { Resolver, Query } from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { ServiceHttp } from '../servicios/http.service';
import {
  CategoriaType,
  AreaType,
  EstadoReporteType,
  EtiquetaType,
} from '../types/catalogo.type';

@Resolver()
export class CatalogosResolver {
  constructor(private readonly rest: ServiceHttp) {}

  @Description('Listado de categorías disponibles.')
  @Query(() => [CategoriaType], {
    description: 'Listado de categorías disponibles.',
  })
  async categorias(): Promise<CategoriaType[]> {
    return this.rest.getCategorias() as any;
  }

  @Description('Listado de áreas registradas.')
  @Query(() => [AreaType], { description: 'Listado de áreas registradas.' })
  async areas(): Promise<AreaType[]> {
    return this.rest.getAreas() as any;
  }

  @Description('Estados posibles de un reporte.')
  @Query(() => [EstadoReporteType], {
    description: 'Estados posibles de un reporte.',
  })
  async estados(): Promise<EstadoReporteType[]> {
    return this.rest.getEstados() as any;
  }

  @Description('Etiquetas para clasificar reportes y comentarios.')
  @Query(() => [EtiquetaType], {
    description: 'Etiquetas para clasificar reportes y comentarios.',
  })
  async etiquetas(): Promise<EtiquetaType[]> {
    return this.rest.getEtiquetas() as any;
  }
}
