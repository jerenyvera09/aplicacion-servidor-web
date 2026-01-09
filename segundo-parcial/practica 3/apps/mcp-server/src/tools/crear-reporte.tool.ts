import { BackendClient, type CreateReportPayload } from '../services/backend-client';
import {
  type ToolDefinition,
  normalizeText,
  pickAssignee,
  stringifyReport,
  toTextResult,
} from './tool-helpers';

const backend = new BackendClient();

export const crear_reporte: ToolDefinition = {
  name: 'crear_reporte',
  description: 'Crea un reporte en el backend (POST /api/reports).',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      userId: { type: 'string', description: 'ID del usuario solicitante' },
      assignedToId: {
        type: 'string',
        description:
          'ID del analista asignado. Si se omite, el sistema elegirá un analista ACTIVE automáticamente.',
      },
      title: { type: 'string', description: 'Título del reporte' },
      description: { type: 'string', description: 'Descripción del reporte' },
      priority: {
        type: 'string',
        description: 'Prioridad (LOW|MEDIUM|HIGH|URGENT)',
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      },
    },
    required: ['userId', 'title', 'description'],
  },
  async handler(args) {
    const userId = normalizeText(args.userId).trim();
    const assignedToId = normalizeText(args.assignedToId).trim();
    const title = normalizeText(args.title).trim();
    const description = normalizeText(args.description).trim();
    const priority = normalizeText(args.priority).trim() as CreateReportPayload['priority'];

    if (!userId || !title || !description) {
      return toTextResult(
        'Parámetros inválidos: userId, title y description son requeridos.',
        true,
      );
    }

    let finalAssignedToId = assignedToId;

    if (!finalAssignedToId) {
      const usersResp = await backend.getActiveUsers();
      if (!usersResp.success || !usersResp.data || usersResp.data.length === 0) {
        return toTextResult(
          'No se encontraron usuarios activos para asignar el reporte. Proporcione assignedToId manualmente.',
          true,
        );
      }

      const candidate = pickAssignee(usersResp.data, userId);
      if (!candidate) {
        return toTextResult(
          'No se encontró un analista ACTIVE distinto al solicitante. Indique assignedToId explícitamente.',
          true,
        );
      }

      finalAssignedToId = candidate.id;
    }

    const createPayload: CreateReportPayload = {
      userId,
      assignedToId: finalAssignedToId,
      title,
      description,
      ...(priority ? { priority } : {}),
    };

    const reportResp = await backend.createReport(createPayload);
    if (!reportResp.success || !reportResp.data) {
      return toTextResult(
        `Error creando reporte: ${reportResp.error ?? 'desconocido'}`,
        true,
      );
    }

    return toTextResult(`Reporte creado exitosamente.\n\n${stringifyReport(reportResp.data)}`);
  },
};
