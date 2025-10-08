
// #hecho por Jereny Vera Mero
import { AppDataSource } from "../data-source";
import { Rol } from "../entities/rol.entidad";
import { Usuario } from "../entities/usuario.entidad";
import { Categoria } from "../entities/categoria.entidad";
import { Area } from "../entities/area.entidad";
import { EstadoReporte } from "../entities/estadoReporte.entidad";
import { Reporte } from "../entities/reporte.entidad";
import { Comentario } from "../entities/comentario.entidad";
import { Puntuacion } from "../entities/puntuacion.entidad";
import { Etiqueta } from "../entities/etiqueta.entidad";

export async function insertarDatosPrueba() {
  const rolRepo = AppDataSource.getRepository(Rol);
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const categoriaRepo = AppDataSource.getRepository(Categoria);
  const areaRepo = AppDataSource.getRepository(Area);
  const estadoRepo = AppDataSource.getRepository(EstadoReporte);
  const reporteRepo = AppDataSource.getRepository(Reporte);
  const comentarioRepo = AppDataSource.getRepository(Comentario);
  const puntuacionRepo = AppDataSource.getRepository(Puntuacion);
  const etiquetaRepo = AppDataSource.getRepository(Etiqueta);

  let admin = await rolRepo.findOne({ where: { nombre: 'Administrador' } });
  if (!admin) admin = await rolRepo.save(rolRepo.create({ nombre: "Administrador" }));
  let normal = await rolRepo.findOne({ where: { nombre: 'Usuario' } });
  if (!normal) normal = await rolRepo.save(rolRepo.create({ nombre: "Usuario" }));

  let alicia = await usuarioRepo.findOne({ where: { correo: 'alicia@uleam.edu.ec' } });
  if (!alicia) alicia = await usuarioRepo.save(usuarioRepo.create({ nombre: "Alicia", correo: "alicia@uleam.edu.ec", contraseña: "1234", rol: admin }));
  let roberto = await usuarioRepo.findOne({ where: { correo: 'roberto@uleam.edu.ec' } });
  if (!roberto) roberto = await usuarioRepo.save(usuarioRepo.create({ nombre: "Roberto", correo: "roberto@uleam.edu.ec", contraseña: "1234", rol: normal }));

  let etiquetaImportante = await etiquetaRepo.findOne({ where: { nombre: 'Importante' } });
  if (!etiquetaImportante) etiquetaImportante = await etiquetaRepo.save(etiquetaRepo.create({ nombre: "Importante", color: "#e74c3c" }));
  if (!alicia.etiquetas || !alicia.etiquetas.some(e => e.id === etiquetaImportante!.id)) {
    alicia.etiquetas = [...(alicia.etiquetas || []), etiquetaImportante];
    await usuarioRepo.save(alicia);
  }

  let catInfra = await categoriaRepo.findOne({ where: { nombre: 'Infraestructura' } });
  if (!catInfra) catInfra = await categoriaRepo.save(categoriaRepo.create({ nombre: "Infraestructura", descripcion: "Daños físicos" }));
  let areaBloque = await areaRepo.findOne({ where: { nombre: 'Bloque A' } });
  if (!areaBloque) areaBloque = await areaRepo.save(areaRepo.create({ nombre: "Bloque A", ubicacion: "Campus Manta" }));
  let estadoAbierto = await estadoRepo.findOne({ where: { nombre: 'Abierto' } });
  if (!estadoAbierto) estadoAbierto = await estadoRepo.save(estadoRepo.create({ nombre: "Abierto", color: "#27ae60" }));

  let reporte = await reporteRepo.findOne({ where: { titulo: 'Fuga de agua en baño 2do piso' } });
  if (!reporte) reporte = await reporteRepo.save(reporteRepo.create({
    usuario: alicia,
    titulo: "Fuga de agua en baño 2do piso",
    descripcion: "Se observa fuga constante en el lavamanos",
    ubicacion: "Bloque A - Baño",
    categoria: catInfra,
    area: areaBloque,
    estado: estadoAbierto
  }));

  let comentario = await comentarioRepo.findOne({ where: { contenido: 'Confirmo el daño, urge reparación' } });
  if (!comentario) comentario = await comentarioRepo.save(comentarioRepo.create({
    usuario: roberto,
    reporte: reporte,
    contenido: "Confirmo el daño, urge reparación",
    etiquetas: [etiquetaImportante]
  }));

  const existingPunt = await puntuacionRepo.findOne({ where: { usuario: { id: roberto.id }, reporte: { id: reporte!.id }, valor: 5 } as any });
  if (!existingPunt) await puntuacionRepo.save(puntuacionRepo.create({ usuario: roberto, reporte: reporte, valor: 5 }));

  return { usuarios: [alicia, roberto], reporte, comentario };
}
