import { buscar_reportes } from './buscar-reportes.tool';
import { crear_reporte } from './crear-reporte.tool';
import { type ToolDefinition } from './tool-helpers';
import { validar_usuario } from './validar-usuario.tool';

export const tools: ToolDefinition[] = [buscar_reportes, validar_usuario, crear_reporte];

export const toolByName: ReadonlyMap<string, ToolDefinition> = new Map(
  tools.map(t => [t.name, t]),
);
