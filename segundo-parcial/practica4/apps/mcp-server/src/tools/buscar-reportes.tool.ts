import { BackendClient, type BackendReport } from '../services/backend-client';
import { type ToolDefinition, toTextResult, includesCaseInsensitive, normalizeText, stringifyReport } from './tool-helpers';

const backend = new BackendClient();

export const buscar_reportes: ToolDefinition = {
  name: 'buscar_reportes',
  description:
    'Busca reportes por palabra clave en title/description. Por defecto busca solo reportes activos.',
  inputSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      keyword: {
        type: 'string',
        description: 'Palabra clave a buscar en title/description',
      },
      onlyActive: {
        type: 'boolean',
        description: 'Si es true, busca solo en /reports/active (default: true)',
        default: true,
      },
    },
    required: ['keyword'],
  },
  async handler(args) {
    const keyword = normalizeText(args.keyword).trim();
    const onlyActive = args.onlyActive === undefined ? true : Boolean(args.onlyActive);

    if (!keyword) {
      return toTextResult('Parámetro inválido: keyword no puede estar vacío.', true);
    }

    const response = onlyActive
      ? await backend.getActiveReports()
      : await backend.getReports();

    if (!response.success || !response.data) {
      return toTextResult(
        `Backend error obteniendo reportes: ${response.error ?? 'desconocido'}`,
        true,
      );
    }

    const filtered = response.data.filter((r: BackendReport) => {
      const blob = `${r.title}\n${r.description}`;
      return includesCaseInsensitive(blob, keyword);
    });

    if (filtered.length === 0) {
      return toTextResult(
        `No se encontraron reportes para "${keyword}"${onlyActive ? ' (solo activos)' : ''}.`,
      );
    }

    const header = `Encontrados ${filtered.length} reporte(s) para "${keyword}"${onlyActive ? ' (solo activos)' : ''}:`;
    const details = filtered.map((r) => `\n---\n${stringifyReport(r)}`).join('');
    return toTextResult(`${header}${details}`);
  },
};
