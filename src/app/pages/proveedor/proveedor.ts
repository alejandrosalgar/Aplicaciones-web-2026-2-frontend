import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Proveedor, ProveedorCrear } from '../../models/proveedor.model';
import { ProveedorService } from '../../services/proveedor.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-proveedor',
  imports: [FormsModule],
  templateUrl: './proveedor.html',
  styleUrl: './proveedor.css',
})
export class Proveedores implements OnInit {
  private readonly proveedorService = inject(ProveedorService);

  readonly filas = signal<Proveedor[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: ProveedorCrear = this.formularioVacio();
  private idEditando = '';

  ngOnInit(): void {
    this.cargarTodos();
  }

  buscarPorId(): void {
    const id = this.idFiltro.trim();
    if (!id) {
      this.cargarTodos();
      return;
    }

    this.cargando.set(true);
    this.proveedorService.obtener(id).subscribe({
      next: (proveedor) => {
        this.filas.set([proveedor]);
        this.avisar('');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  limpiarFiltro(): void {
    this.idFiltro = '';
    this.cargarTodos();
  }

  abrirCrear(): void {
    this.modo.set('crear');
    this.idEditando = '';
    this.formulario = this.formularioVacio();
    this.popupAbierto.set(true);
  }

  abrirEditar(fila: Proveedor): void {
    this.modo.set('editar');
    this.idEditando = fila.id;
    this.formulario = {
      nombre: fila.nombre,
      nit: fila.nit,
      contacto: fila.contacto,
      telefono: fila.telefono,
      email: fila.email,
      direccion: fila.direccion,
      activo: fila.activo,
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa los datos del proveedor y verifica el email.', true);
      return;
    }

    this.cargando.set(true);
    const datos = this.datosFormulario();
    if (this.modo() === 'crear') {
      this.proveedorService.crear(datos).subscribe({
        next: () => this.despuesDeGuardar('Proveedor creado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.proveedorService.actualizar(this.idEditando, datos).subscribe({
      next: () => this.despuesDeGuardar('Proveedor actualizado'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Proveedor): void {
    const confirmar = confirm(`Eliminar a ${fila.nombre}?`);
    if (!confirmar) {
      return;
    }

    this.cargando.set(true);
    this.proveedorService.eliminar(fila.id).subscribe({
      next: () => {
        this.avisar('Proveedor eliminado');
        this.refrescar();
      },
      error: (error: HttpErrorResponse) => {
        this.avisar(this.textoError(error, false), true);
        this.cargando.set(false);
      },
    });
  }

  private cargarTodos(): void {
    this.cargando.set(true);
    this.proveedorService.listar().subscribe({
      next: (filas) => {
        this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay proveedores registrados');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        this.avisar(this.textoError(error, true), true);
        this.cargando.set(false);
      },
    });
  }

  private refrescar(): void {
    if (this.idFiltro.trim()) {
      this.buscarPorId();
      return;
    }
    this.cargarTodos();
  }

  private despuesDeGuardar(texto: string): void {
    this.popupAbierto.set(false);
    this.avisar(texto);
    this.refrescar();
  }

  private falloGuardar(error: HttpErrorResponse): void {
    this.avisar(this.textoError(error, false), true);
    this.cargando.set(false);
  }

  private formularioValido(): boolean {
    const datos = this.formulario;
    return Boolean(
      datos.nombre.trim() &&
        datos.nit.trim() &&
        datos.contacto.trim() &&
        datos.telefono.trim() &&
        datos.email.trim() &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim()) &&
        datos.direccion.trim(),
    );
  }

  private datosFormulario(): ProveedorCrear {
    const datos = this.formulario;
    return {
      nombre: datos.nombre.trim(),
      nit: datos.nit.trim(),
      contacto: datos.contacto.trim(),
      telefono: datos.telefono.trim(),
      email: datos.email.trim(),
      direccion: datos.direccion.trim(),
      activo: datos.activo,
    };
  }

  private formularioVacio(): ProveedorCrear {
    return {
      nombre: '',
      nit: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
      activo: true,
    };
  }

  private avisar(texto: string, error = false): void {
    this.mensaje.set(texto);
    this.esError.set(error && texto.length > 0);
  }

  private textoError(error: HttpErrorResponse, alListar: boolean): string {
    if (error.status === 0) {
      return 'No se pudo conectar con la API. Revisa que el backend este en el puerto 8000.';
    }
    if (error.status === 404) {
      return alListar
        ? 'El endpoint de proveedores no esta disponible en la API'
        : 'Proveedor no encontrado';
    }
    if (error.status === 409) {
      return 'Ya existe un proveedor con ese NIT o email';
    }
    if (error.status === 422) {
      return 'Revisa los datos. El filtro por ID tiene que ser un UUID.';
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    return 'No se pudo completar la operacion';
  }
}
