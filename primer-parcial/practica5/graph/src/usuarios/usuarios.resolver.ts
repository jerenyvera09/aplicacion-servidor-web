import { Resolver, Query } from '@nestjs/graphql';
import { Description } from '../common/description.decorator';
import { ServiceHttp } from '../servicios/http.service';
import { UsuarioType } from '../types/usuario-transaccional.type';

@Resolver()
export class UsuariosResolver {
  constructor(private readonly rest: ServiceHttp) {}

  @Description('Usuarios registrados en el sistema.')
  @Query(() => [UsuarioType], {
    description: 'Usuarios registrados en el sistema.',
  })
  async usuarios(): Promise<UsuarioType[]> {
    return this.rest.getUsuarios() as any;
  }

  @Description('Listado de roles disponibles.')
  @Query(() => [String], { description: 'Listado de roles disponibles.' })
  async roles(): Promise<string[]> {
    const roles = await this.rest.getRoles();
    // Suponiendo que el endpoint devuelve objetos con 'nombre'. Ajustar si es diferente.
    return roles.map((r: any) => r.nombre ?? r.rol ?? String(r));
  }
}
