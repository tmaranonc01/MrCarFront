import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';
import { Piezas } from './paginas/piezas/piezas';
import { PiezaDetalle } from './paginas/pieza-detalle/pieza-detalle';
import { Deseos } from './paginas/deseos/deseos';
import { AdminCoches } from './paginas/admin-coches/admin-coches';
import { AdminPiezas } from './paginas/admin-piezas/admin-piezas';
import { Registro } from './paginas/registro/registro';
import { Home } from './paginas/home/home';


export const routes: Routes = [
  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

   { path: 'deseos', component: Deseos },

  { path: 'admin/coches', component: AdminCoches },
  { path: 'admin/piezas', component: AdminPiezas },

  { path: 'piezas', component: Piezas },
  { path: 'piezas/:id', component: PiezaDetalle },



  { path: '**', redirectTo: '' }
];
