import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Proveedor, ProveedorActualizar, ProveedorCrear } from '../models/proveedor.model';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/proveedores`;

  listar(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.base}/`);
  }

  obtener(id: string): Observable<Proveedor> {
    return this.http.get<Proveedor>(`${this.base}/${id}`);
  }

  crear(datos: ProveedorCrear): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.base}/`, datos);
  }

  actualizar(id: string, datos: ProveedorActualizar): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.base}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
