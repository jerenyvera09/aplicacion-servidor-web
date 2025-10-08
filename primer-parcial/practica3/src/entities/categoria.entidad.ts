// #hecho por Carlos Delgado
// Clasificación Taller:
// Integrante 2 (Entidades de Negocio Principal / Catálogo operativo) - Carlos Delgado
// Motivo: Categoría clasifica funcionalmente los reportes.

    import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
    import { Reporte } from "./reporte.entidad";

    @Entity("categorias")
    export class Categoria {
      // Se mantiene UUID (decisión de diseño). Si se requiere autoincrement entero, cambiar a @PrimaryGeneratedColumn().
      @PrimaryGeneratedColumn("uuid")
      id!: string;

      @Column()
      nombre!: string;

      @Column({ nullable: true })
      descripcion?: string;

      @Column({ nullable: true })
      prioridad?: string;

      @Column({ default: "activo" })
      estado!: string;

      @OneToMany(() => Reporte, (reporte) => reporte.categoria)
      reportes!: Reporte[];
    }
