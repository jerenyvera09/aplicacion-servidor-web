import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GraphqlService {
  constructor(private readonly http: HttpService) {}

  async obtenerVehiculos() {
    const res$ = this.http.get('http://localhost:3000/vehiculo');
    const { data } = await lastValueFrom(res$);
    return Array.isArray(data) ? data : [];
  }

  async obtenerConductores() {
    const res$ = this.http.get('http://localhost:3000/conductor');
    const { data } = await lastValueFrom(res$);
    return Array.isArray(data) ? data : [];
  }

  async obtenerCoberturas() {
    const res$ = this.http.get('http://localhost:3000/cobertura');
    const { data } = await lastValueFrom(res$);
    return Array.isArray(data) ? data : [];
  }

  async obtenerVehiculoPorId(id: string) {
    const res$ = this.http.get(`http://localhost:3000/vehiculo/${id}`);
    const { data } = await lastValueFrom(res$);
    return data ?? null;
  }
}
