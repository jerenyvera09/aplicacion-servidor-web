export class CreateReportDto {
    userId: string;
    assignedToId: string;
    title: string;
    description: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}
