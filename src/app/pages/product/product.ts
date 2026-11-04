import {Component, OnInit, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Product, ProductCreate} from '../../models/product.model';
import {ProductService} from '../../services/product.service';

@Component({
  selector: 'app-product',
  imports: [FormsModule],
  templateUrl: './product.html',
  styleUrl: './product.css',
})
export class ProductPage implements OnInit {
  private service = inject(ProductService);

  products = signal<Product[]>([]);
  error = signal('');
  editingId = signal<string | null>(null);
  form: ProductCreate = this.emptyForm();

  ngOnInit() {
    this.load();
  }

  load() {
    this.service.list().subscribe({
      next: (data) => {
        this.products.set(data);
        console.log("Products loaded:", data);
      },
      error: (err) => {
        this.error.set(this.message(err));
        console.error("Error loading products:", err);
      }
    })
  }

  save() {
    this.error.set('');
    const body: ProductCreate = {
      ...this.form,
      cost: Number(this.form.cost),
      stock: Number(this.form.stock),
    };
    const id = this.editingId();
    const request = id ? this.service.update(id, body) : this.service.create(body);

    request.subscribe({
      next: () => {
        this.reset();
        this.load();
      },
      error: (err) => this.error.set(this.message(err)),
    });
  }

  edit(p: Product) {
    this.editingId.set(p.id);
    this.form = {
      name: p.name,
      description: p.description,
      category: p.category,
      sku: p.sku,
      cost: Number(p.cost),
      stock: p.stock,
      available: p.available,
      image_url: p.image_url,
      brand: p.brand,
    };
  }

  remove(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    this.service.delete(p.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(this.message(err)),
    });
  }

  reset() {
    this.editingId.set(null);
    this.form = this.emptyForm();
  }

  private emptyForm(): ProductCreate {
    return {
      name: '',
      description: '',
      category: '',
      sku: '',
      cost: 0,
      stock: 0,
      available: true,
      image_url: null,
      brand: null,
    };
  }

  private message(err: any): string {
    const detail = err?.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((d: any) => d.msg).join(' | ');
    return 'No se pudo conectar con el servidor';
  }
  searchId = '';

buscar() {
  const id = this.searchId.trim();
  if (!id) {
    this.error.set('');
    this.load();
    return;
  }
  this.error.set('');
  this.service.getById(id).subscribe({
    next: (p) => this.products.set([p]),
    error: (err) => {
      this.products.set([]);
      if (err.status === 404) this.error.set('No se encontró un producto con ese id');
      else if (err.status === 422) this.error.set('El id no tiene un formato válido');
      else if (err.status === 0) this.error.set('No hubo conexión con el servidor');
      else this.error.set(this.message(err));
    },
  });
}

limpiarBusqueda() {
  this.searchId = '';
  this.error.set('');
  this.load();
}
}
