import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnimalCreate, AnimalUpdate, AnimalResponse } from '../models/animal.model';

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private readonly baseUrl = `${environment.apiUrl}/animales`;

  constructor(private http: HttpClient) {}

  listar(): Observable<AnimalResponse[]> {
    return this.http.get<AnimalResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: string): Observable<AnimalResponse> {
    return this.http.get<AnimalResponse>(`${this.baseUrl}/${id}`);
  }

  crear(datos: AnimalCreate): Observable<AnimalResponse> {
    return this.http.post<AnimalResponse>(this.baseUrl, datos);
  }

  actualizar(id: string, datos: AnimalUpdate): Observable<AnimalResponse> {
    return this.http.put<AnimalResponse>(`${this.baseUrl}/${id}`, datos);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
