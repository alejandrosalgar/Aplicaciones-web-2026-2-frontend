import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Empleados } from './pages/empleado/empleado';
import { Animales } from './pages/animal/animal';
import { Proveedores } from './pages/proveedor/proveedor';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'Empleados' },
      { path: 'Empleados', component: Empleados },
      { path: 'Animales', component: Animales },
      { path: 'Proveedores', component: Proveedores },
    ],
  },
  { path: '**', redirectTo: 'Empleados' },
];
