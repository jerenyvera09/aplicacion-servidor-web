
// #hecho por Jereny Vera Mero
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { insertarDatosPrueba } from "./utils/datosPrueba";
import { UsuarioServicio } from "./services/usuario.service";
import { ReporteServicio } from "./services/reporte.service";
import { ComentarioServicio } from "./services/comentario.service";
import { PuntuacionServicio } from "./services/puntuacion.service";
import { EtiquetaServicio } from "./services/etiqueta.service";
import { AreaServicio } from "./services/area.service";
import { CategoriaServicio } from "./services/categoria.service";
import { EstadoReporteServicio } from "./services/estadoReporte.service";
import { ArchivoAdjuntoServicio } from "./services/archivoAdjunto.service";
import { RolServicio } from "./services/rol.service";

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const blue  = (s: string) => `\x1b[34m${s}\x1b[0m`;
const yellow= (s: string) => `\x1b[33m${s}\x1b[0m`;
const red   = (s: string) => `\x1b[31m${s}\x1b[0m`;

async function main() {
  await AppDataSource.initialize();
  console.log(green("✅ Fuente de datos inicializada"));

  // --- Ejemplo directo usando repositorio (estilo docente) ---
  const { Usuario } = await Promise.resolve(require("./entities/usuario.entidad"));
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  const crearUsuarioDemo = async () => {
    const correo = "demo@uleam.edu.ec";
    let existente = await usuarioRepo.findOne({ where: { correo } });
    if (existente) return existente;
    const u = usuarioRepo.create({ nombre: "DemoUsuario", correo, contraseña: "demo123", estado: "activo" });
    return await usuarioRepo.save(u);
  };

  const listarUsuariosDemo = async () => {
    const all = await usuarioRepo.find();
    console.log("Usuarios (repo directo):", all.map(x => ({ id: x.id, nombre: x.nombre })));
  };

  const demoUser = await crearUsuarioDemo();
  await listarUsuariosDemo();

  const { reporte } = await insertarDatosPrueba();
  console.log(green("✅ Datos de prueba insertados"));

  const usuarioSrv = new UsuarioServicio();
  const reporteSrv = new ReporteServicio();
  const comentarioSrv = new ComentarioServicio();
  const puntuacionSrv = new PuntuacionServicio();
  const etiquetaSrv = new EtiquetaServicio();
  const areaSrv = new AreaServicio();
  const categoriaSrv = new CategoriaServicio();
  const estadoSrv = new EstadoReporteServicio();
  const archivoSrv = new ArchivoAdjuntoServicio();
  const rolSrv = new RolServicio();

  // Listar reportes
  const todosReportes = await reporteSrv.findAll();
  console.log(blue("🔵 Reportes:"), todosReportes.map(r => ({ id: r.id, titulo: r.titulo })));

  // Actualizar un reporte
  const actualizado = await reporteSrv.update(reporte.id, { titulo: "Fuga de agua (actualizado)" });
  console.log(yellow("🟡 Reporte actualizado:"), actualizado?.titulo);

  // Crear y eliminar un comentario
  const nuevoComentario = await comentarioSrv.create({ contenido: "Comentario temporal", reporte: reporte, usuario: todosReportes[0].usuario });
  console.log(green("🟢 Comentario creado ID:"), nuevoComentario.id);
  await comentarioSrv.remove(nuevoComentario.id);
  console.log(red("🔴 Comentario eliminado ID:"), nuevoComentario.id);

  // Crear etiqueta y asignarla a un usuario
  const nuevaEtiqueta = await etiquetaSrv.create({ nombre: "Prioritario", color: "#8e44ad" });
  const usuarios = await usuarioSrv.findAll();
  if (usuarios[0]) {
    usuarios[0].etiquetas = [...(usuarios[0].etiquetas || []), nuevaEtiqueta];
    await usuarioSrv.update(usuarios[0].id, { etiquetas: usuarios[0].etiquetas });
    console.log(green("🟢 Etiqueta asignada a usuario:"), usuarios[0].nombre);
  }

  // ---- CRUD demo for other entities ----
  // Area
  const todasAreas = await areaSrv.findAll();
  console.log(blue("🔵 Areas:"), todasAreas.map(a => ({ id: a.id, nombre: a.nombre })));
  const nuevaArea = await areaSrv.create({ nombre: "Area Demo", responsable: "Juan" });
  console.log(green("🟢 Area creada ID:"), nuevaArea.id);
  await areaSrv.update(nuevaArea.id, { responsable: "María" });
  await areaSrv.remove(nuevaArea.id);

  // Categoria
  const todasCategorias = await categoriaSrv.findAll();
  console.log(blue("🔵 Categorias:"), todasCategorias.map(c => ({ id: c.id, nombre: c.nombre })));

  // EstadoReporte
  const todosEstados = await estadoSrv.findAll();
  console.log(blue("🔵 Estados de Reporte:"), todosEstados.map(e => ({ id: e.id, nombre: e.nombre })));

  // ArchivoAdjunto (crear vinculado a un reporte si existe)
  const archivosAntes = await archivoSrv.findAll();
  console.log(blue("🔵 Archivos adjuntos (antes):"), archivosAntes.length);
  const archivosReportes = await reporteSrv.findAll();
  if (archivosReportes[0]) {
    const f = await archivoSrv.create({ nombre_archivo: "foto.jpg", tipo: "image/jpeg", url: "http://example.com/foto.jpg", reporte: archivosReportes[0] });
    console.log(green("🟢 Archivo creado ID:"), f.id);
    await archivoSrv.remove(f.id);
  }

  // Rol
  const roles = await rolSrv.findAll();
  console.log(blue("🔵 Roles:"), roles.map(r => ({ id: r.id, nombre: r.nombre })));

  // Puntuaciones (listar)
  const todasPuntuaciones = await puntuacionSrv.findAll();
  console.log(blue("🔵 Puntuaciones:"), todasPuntuaciones.map(p => ({ id: p.id, valor: p.valor })));

  console.log(green("✅ Pruebas CRUD finalizadas."));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
