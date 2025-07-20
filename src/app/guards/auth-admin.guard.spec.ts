import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, CanActivateFn, Router, RouterStateSnapshot, UrlSegment } from '@angular/router';

import { authAdminGuard } from './auth-admin.guard';
import { AuthService } from '../services/api/auth.service';
import { firstValueFrom, isObservable, lastValueFrom, Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../interfaces/apiresponse';
import { appConfig } from '../app.config';

// PARA TEST: https://attempto.blog/en/2024/testing-functional-guards/
// https://dev.to/this-is-angular/testing-angular-route-guards-with-the-routertestingmodule-45c9
// https://levelup.gitconnected.com/authguard-authguard-unit-test-with-angular-16-c46738532cdd
// https://www.youtube.com/watch?v=MDCKq_e7Q04

const mockAuthService: {
  comprobarLogin: () => Observable<ApiresponsePartial>
} = {
  comprobarLogin: () => of({}) // Lo dejamos aquí vacío, porque lo podremos rellenar más adelante en cada test
}

const mockComprobarLoginCorrecto = {
  'message': 'El usuario está autenticado.'
}

const mockComprobarLoginIncorrecto = {
  'error': 'El usuario no está autenticado.'
}

const mockRouter = jasmine.createSpyObj("Router", ["navigate"]);

describe('authAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authAdminGuard(...guardParameters));
  let authService: AuthService
  let activatedRoute: ActivatedRoute

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        ...appConfig.providers,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter},
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [new UrlSegment('/admin', {})],  // Simulamos que estamos en la ruta protegida
              params: {},
              queryParams: {},
              fragment: null,
              data: {},
            },
          },
        }
      ]
    });

    authService = TestBed.inject(AuthService)
    activatedRoute = TestBed.inject(ActivatedRoute)
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true in guard because user is logged', async () => {
    const spyAuthService = spyOn(authService, 'comprobarLogin')
    spyAuthService.and.returnValue(of(mockComprobarLoginCorrecto))

    const route: any = {};
    const state: any = {};
    const guard = executeGuard(route, state)

    const result = isObservable(guard) ? await lastValueFrom(guard) : await guard

    expect(result).toBeTrue()
    expect(mockRouter.navigate).not.toHaveBeenCalled()
  })

  it('should return false in guard because user is not logged', async () => {
    const spyAuthService = spyOn(authService, 'comprobarLogin')
    spyAuthService.and.returnValue(throwError(() => mockComprobarLoginIncorrecto))

    const guard = executeGuard(activatedRoute.snapshot, {} as RouterStateSnapshot)
    const guardResult = isObservable(guard) ? await lastValueFrom(guard) : await guard
    
    expect(guardResult).toBe(false)
    expect(mockRouter.navigate).toHaveBeenCalledWith([""])
  })
});
