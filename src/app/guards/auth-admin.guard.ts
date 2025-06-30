import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { catchError, map, of } from 'rxjs';

export const authAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Se debe convertir el observable en un boolean con map para que el guard funcione antes de que cargue la página protegida
  return authService.comprobarLogin().pipe(
    map((respuesta) => {
      return true;
    }),
    catchError((error) => { // Se denegará el acceso en caso de error
      router.navigate(['']);
      return of(false); // `of(false)` emite false para que el guard deniegue el acceso
    })
  )
};
