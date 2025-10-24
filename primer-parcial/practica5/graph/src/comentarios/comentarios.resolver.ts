import {
  Resolver,
  Query,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { ServiceHttp } from '../servicios/http.service';
import {
  ComentarioType,
  UsuarioType,
} from '../types/usuario-transaccional.type';
import DataLoader from 'dataloader';
/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

@Resolver(() => ComentarioType)
export class ComentariosResolver {
  constructor(private readonly rest: ServiceHttp) {}

  // DataLoader para usuarios referenciados en comentarios
  private readonly usuarioLoader = new DataLoader<number, UsuarioType | null>(
    async (ids) => {
      const usuarios =
        (await this.rest.getUsuarios()) as unknown as UsuarioType[];
      return ids.map((id) => usuarios.find((u) => u.id === id) ?? null);
    },
  );

  @Description(
    'Comentarios, opcionalmente filtrados por reporteId (últimos primero en cliente).',
  )
  @Query(() => [ComentarioType], {
    description:
      'Comentarios, opcionalmente filtrados por reporteId (últimos primero en cliente).',
  })
  async comentarios(
    @Args('reporteId', { type: () => Int, nullable: true }) reporteId?: number,
  ): Promise<ComentarioType[]> {
    let items =
      (await this.rest.getComentarios()) as unknown as ComentarioType[];
    if (reporteId)
      items = (items as unknown as any[]).filter(
        (c) => Number(c?.reporte?.id ?? c?.reporteId) === reporteId,
      ) as any;
    return items as unknown as ComentarioType[];
  }

  // Poblar el usuario del comentario usando DataLoader si solo viene el id
  @ResolveField(() => UsuarioType, { nullable: true })
  async usuario(@Parent() comentario: any): Promise<UsuarioType | null> {
    if (comentario?.usuario && comentario.usuario.id)
      return comentario.usuario as UsuarioType;
    const id = comentario?.usuarioId ?? comentario?.usuario?.id;
    if (!id) return null;
    return this.usuarioLoader.load(Number(id));
  }
}
