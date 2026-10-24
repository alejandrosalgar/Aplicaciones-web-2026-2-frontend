export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  email: string;
}

export type EmpleadoCrear = Omit<Empleado, 'id'>;

export type EmpleadoActualizar = EmpleadoCrear;
