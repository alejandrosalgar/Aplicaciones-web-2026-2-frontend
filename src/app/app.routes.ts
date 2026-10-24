import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Empleados } from './pages/empleado/empleado';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'Empleados' },
      { path: 'Empleados', component: Empleados }
    ],
  },
  { path: '**', redirectTo: 'Empleados' },
];
