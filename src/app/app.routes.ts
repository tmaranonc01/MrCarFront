import { Routes } from '@angular/router';
import { Login } from './paginas/login/login';
import { Piezas } from './paginas/piezas/piezas';
import { PiezaDetalle } from './paginas/pieza-detalle/pieza-detalle';
import { Deseos } from './paginas/deseos/deseos';
import { AdminCoches } from './paginas/admin-coches/admin-coches';
import { AdminPiezas } from './paginas/admin-piezas/admin-piezas';
import { Registro } from './paginas/registro/registro';
import { Home } from './paginas/home/home';
import { soloLogueadoGuard } from './guards/solo-logueado-guard';
import { soloAdminGuard } from './guards/solo-admin-guard';
import { deseosResolver } from './resolvers/deseos-resolver';


export const routes: Routes = [
  { path: '', component: Home },

  { path: 'login', component: Login },
  { path: 'registro', component: Registro },

  {
    path: 'deseos',
    component: Deseos,
    canActivate: [soloLogueadoGuard],
    resolve: { deseos: deseosResolver },
  },

  { path: 'admin/coches', component: AdminCoches, canActivate: [soloAdminGuard] },
  { path: 'admin/piezas', component: AdminPiezas, canActivate: [soloAdminGuard] },

  { path: 'piezas', component: Piezas },
  { path: 'piezas/:id', component: PiezaDetalle },



  { path: '**', redirectTo: '' }
];
