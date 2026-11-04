import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/products`;

  list(): Observable<Product[]> {
    console.log("url:", this.url);
    return this.http.get<Product[]>(this.url);
  }

  getById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  create(data: ProductCreate): Observable<Product> {
    return this.http.post<Product>(this.url, data);
  }

  update(id: string, data: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`); // devuelve 204, sin contenido
  }
}
