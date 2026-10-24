import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Empleado, EmpleadoActualizar, EmpleadoCrear } from '../models/empleado.model';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/empleados`;

  listar(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.base);
  }

  obtener(id: string): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.base}/${id}`);
  }

  crear(datos: EmpleadoCrear): Observable<Empleado> {
    return this.http.post<Empleado>(this.base, datos);
  }

  actualizar(id: string, datos: EmpleadoActualizar): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
