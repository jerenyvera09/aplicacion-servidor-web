import { type BackendReport, type BackendUser } from '../services/backend-client';

export type ToolInputSchema = Record<string, unknown>;

export type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};

export type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
};

export function toTextResult(text: string, isError = false): ToolResult {
  return {
    content: [{ type: 'text', text }],
    ...(isError ? { isError: true } : {}),
  };
}

export function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function includesCaseInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

export function stringifyReport(report: BackendReport): string {
  const createdAt =
    typeof report.createdAt === 'string'
      ? report.createdAt
      : report.createdAt.toISOString();
  const findings = report.findings ? `\nHallazgos: ${report.findings}` : '';
  return (
    [
      `ID: ${report.id}`,
      `Título: ${report.title}`,
      `Usuario: ${report.userId}`,
      `Asignado a: ${report.assignedToId}`,
      `Prioridad: ${report.priority}`,
      `Estado: ${report.status}`,
      `Creado: ${createdAt}`,
      `Descripción: ${report.description}`,
    ].join('\n') + findings
  );
}

export function pickAssignee(
  activeUsers: BackendUser[],
  requesterId: string,
): BackendUser | undefined {
  const analysts = activeUsers.filter((u) => u.status === 'ACTIVE' && u.role === 'ANALYST');
  const notRequester = analysts.find((u) => u.id !== requesterId);
  return notRequester ?? analysts[0];
}
