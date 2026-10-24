import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Empleado, EmpleadoCrear } from '../../models/empleado.model';
import { EmpleadoService } from '../../services/empleado.service';

type ModoPopup = 'crear' | 'editar';

@Component({
  selector: 'app-empleado',
  imports: [FormsModule],
  templateUrl: './empleado.html',
  styleUrl: './empleado.css',
})
export class Empleados implements OnInit {
  private readonly empleadoService = inject(EmpleadoService);

  readonly filas = signal<Empleado[]>([]);
  readonly mensaje = signal('');
  readonly esError = signal(false);
  readonly cargando = signal(false);
  readonly popupAbierto = signal(false);
  readonly modo = signal<ModoPopup>('crear');

  idFiltro = '';
  formulario: EmpleadoCrear = this.formularioVacio();
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
    this.empleadoService.obtener(id).subscribe({
      next: (empleado) => {
        this.filas.set([empleado]);
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

  abrirEditar(fila: Empleado): void {
    this.modo.set('editar');
    this.idEditando = fila.id;
    this.formulario = {
      nombre: fila.nombre,
      cargo: fila.cargo,
      departamento: fila.departamento,
      email: fila.email,
    };
    this.popupAbierto.set(true);
  }

  cerrarPopup(): void {
    this.popupAbierto.set(false);
  }

  guardar(): void {
    if (!this.formularioValido()) {
      this.avisar('Completa nombre, cargo, departamento y email.', true);
      return;
    }

    this.cargando.set(true);
    const datos = this.datosFormulario();
    if (this.modo() === 'crear') {
      this.empleadoService.crear(datos).subscribe({
        next: () => this.despuesDeGuardar('Empleado creado'),
        error: (error: HttpErrorResponse) => this.falloGuardar(error),
      });
      return;
    }

    this.empleadoService.actualizar(this.idEditando, datos).subscribe({
      next: () => this.despuesDeGuardar('Empleado actualizado'),
      error: (error: HttpErrorResponse) => this.falloGuardar(error),
    });
  }

  eliminar(fila: Empleado): void {
    const confirmar = confirm(`Eliminar a ${fila.nombre}?`);
    if (!confirmar) {
      return;
    }

    this.cargando.set(true);
    this.empleadoService.eliminar(fila.id).subscribe({
      next: () => {
        this.avisar('Empleado eliminado');
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
    this.empleadoService.listar().subscribe({
      next: (filas) => {
        this.filas.set(filas);
        this.avisar(filas.length ? '' : 'No hay registros');
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.filas.set([]);
        const listaVacia = error.status === 404;
        this.avisar(listaVacia ? 'No hay registros' : this.textoError(error, true), !listaVacia);
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
        datos.cargo.trim() &&
        datos.departamento.trim() &&
        datos.email.trim(),
    );
  }

  private datosFormulario(): EmpleadoCrear {
    const datos = this.formulario;
    return {
      nombre: datos.nombre.trim(),
      cargo: datos.cargo.trim(),
      departamento: datos.departamento.trim(),
      email: datos.email.trim(),
    };
  }

  private formularioVacio(): EmpleadoCrear {
    return {
      nombre: '',
      cargo: '',
      departamento: '',
      email: '',
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
      return alListar ? 'No hay registros' : 'Empleado no encontrado';
    }
    if (error.status === 409) {
      return 'Ese email ya existe';
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
