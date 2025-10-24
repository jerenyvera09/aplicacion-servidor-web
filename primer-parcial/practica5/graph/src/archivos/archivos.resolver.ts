import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { ServiceHttp } from '../servicios/http.service';
import { ArchivoAdjuntoType } from '../types/usuario-transaccional.type';

@Resolver()
export class ArchivosResolver {
  constructor(private readonly rest: ServiceHttp) {}

  @Description('Archivos adjuntos, opcionalmente filtrados por reporteId.')
  @Query(() => [ArchivoAdjuntoType], {
    description: 'Archivos adjuntos, opcionalmente filtrados por reporteId.',
  })
  async archivosAdjuntos(
    @Args('reporteId', { type: () => Int, nullable: true }) reporteId?: number,
  ): Promise<ArchivoAdjuntoType[]> {
    let items = (await this.rest.getArchivos()) as any[];
    if (reporteId) items = items.filter((a: any) => a.reporte?.id === reporteId || a.reporteId === reporteId);
    return items as any;
  }
}
