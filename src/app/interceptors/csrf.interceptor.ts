import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { CsrfService } from '../services/api/csrf.service';
import { map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService)
  const csrfService = inject(CsrfService)

  let xsrfToken = cookieService.get('lh_xsrf_token')

  if(req.method.toUpperCase() != 'GET') {
    if(xsrfToken) {
      const cloned = req.clone({
        setHeaders: {
          "_xsrf_token": xsrfToken,
          "Content-Type": "application/json"
        }
      });
      return next(cloned)
    } else {
      return csrfService.getCsrf().pipe(
      // Modificamos internamente el valor emitido por el observable o lo que ocurre dentro
      map((respuesta) => {
        xsrfToken = respuesta.data // Tenemos que volver a asignar aquí el token, de lo contrario xsrfToken será el que había antes cuando se declaró antes del if
        const cloned = req.clone({
          headers: req.headers.set('_xsrf_token', xsrfToken),
        });
        cookieService.set('lh_xsrf_token', xsrfToken, {
          path: '/',
          domain: environment.frontDomain,
          sameSite: 'Strict',
          secure: true
        })
        return cloned;
      }),
      // Esperamos a que se resuelva el observable y cambia el flujo del observable sin romper la asincronía, es decir, intercambia el observable
      // Si no usamos switchMap se devuelve un observable anidado: Observable<Observable>, habría que suscribirse 2 veces. SwitchMap devuelve el observable interno
      switchMap((cloneReq) => next(cloneReq))
    );

    }
  }
  return next(req);
};