
// #hecho por Cinthia Zambrano
import "reflect-metadata";
import { DataSource } from "typeorm";

import { Usuario } from "./entities/usuario.entidad";
import { Rol } from "./entities/rol.entidad";
import { Reporte } from "./entities/reporte.entidad";
import { Categoria } from "./entities/categoria.entidad";
import { ArchivoAdjunto } from "./entities/archivoAdjunto.entidad";
import { Area } from "./entities/area.entidad";
import { EstadoReporte } from "./entities/estadoReporte.entidad";
import { Comentario } from "./entities/comentario.entidad";
import { Puntuacion } from "./entities/puntuacion.entidad";
import { Etiqueta } from "./entities/etiqueta.entidad";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [Usuario, Rol, Reporte, Categoria, ArchivoAdjunto, Area, EstadoReporte, Comentario, Puntuacion, Etiqueta],
});
