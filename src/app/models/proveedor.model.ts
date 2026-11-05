export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
}

export type ProveedorCrear = Omit<Proveedor, 'id'>;

export type ProveedorActualizar = ProveedorCrear;
