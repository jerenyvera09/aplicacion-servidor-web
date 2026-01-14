import { BackendClient } from '../services/backend-client';
import { type ToolDefinition, normalizeText, toTextResult } from './tool-helpers';

const backend = new BackendClient();

export const validar_usuario: ToolDefinition = {
  name: 'validar_usuario',
  description: 'Valida si un usuario existe y está en estado ACTIVE.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      userId: { type: 'string', description: 'ID del usuario a validar' },
    },
    required: ['userId'],
  },
  async handler(args) {
    const userId = normalizeText(args.userId).trim();
    if (!userId) return toTextResult('Parámetro inválido: userId es requerido.', true);

    const response = await backend.getUserById(userId);
    if (!response.success || !response.data) {
      return toTextResult(`Usuario no válido: ${response.error ?? 'no encontrado'}`, true);
    }

    const isActive = response.data.status === 'ACTIVE';
    return toTextResult(
      isActive
        ? `Usuario ${response.data.id} está ACTIVE (rol: ${response.data.role}).`
        : `Usuario ${response.data.id} NO está activo (status: ${response.data.status}).`,
      !isActive,
    );
  },
};
