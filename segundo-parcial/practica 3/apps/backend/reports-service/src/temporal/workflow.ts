export async function createReportSaga(input: {
  reportId: string;
  userId: string;
  assignedToId: string;
}): Promise<{ success: boolean; reportId: string }> {
  // Temporal está desacoplado por defecto; este flujo es un stub seguro alineado al dominio REPORT.
  return { success: true, reportId: input.reportId };
}
