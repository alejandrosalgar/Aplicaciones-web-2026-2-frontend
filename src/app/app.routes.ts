import { Routes } from '@angular/router';

import { Shell } from './layout/shell/shell';
import { Empleados } from './pages/empleado/empleado';
import { ProductPage } from './pages/product/product';


export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'Empleados' },
      { path: 'Empleados', component: Empleados },
      { path: 'products', component: ProductPage },
    ],
  },
  { path: '**', redirectTo: 'Empleados' },
];
