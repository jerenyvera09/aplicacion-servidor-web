import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { ServiceHttp } from '../servicios/http.service';
import { PuntuacionType } from '../types/usuario-transaccional.type';

@Resolver()
export class PuntuacionesResolver {
  constructor(private readonly rest: ServiceHttp) {}

  @Description('Puntuaciones (1..5), opcionalmente filtradas por reporteId.')
  @Query(() => [PuntuacionType], {
    description: 'Puntuaciones (1..5), opcionalmente filtradas por reporteId.',
  })
  async puntuaciones(
    @Args('reporteId', { type: () => Int, nullable: true }) reporteId?: number,
  ): Promise<PuntuacionType[]> {
    let items = (await this.rest.getPuntuaciones()) as any[];
    if (reporteId) items = items.filter((p: any) => p.reporte?.id === reporteId || p.reporteId === reporteId);
    return items as any;
  }
}
