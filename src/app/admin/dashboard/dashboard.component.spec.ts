import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { appConfig } from '../../app.config';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../../services/api/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { Router } from '@angular/router';

const mockAuthService: {
  logout: () => Observable<ApiresponsePartial>
} = {
  logout: () => of({})
}

const mockRouter : {
  navigate: (url: string) => Promise<boolean>
} = {
  navigate: () => Promise.resolve(true)
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let responsiveService: ResponsivedesignService;
  let authService: AuthService;
  let cookieService: CookieService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [...appConfig.providers,
        ResponsivedesignService,
        { provider: AuthService, useValue: mockAuthService },
        CookieService,
        { provider: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsivedesignService)
    authService = TestBed.inject(AuthService)
    cookieService = TestBed.inject(CookieService)
    router = TestBed.inject(Router)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user, getUser()', async () => {
    cookieService.set('_user_lh', 'token')
    component.getUser()
    expect(component.user).toBe('token')
  })

  it('should logout, logout()', () => {
    cookieService.set('_user_lh', 'token')
    cookieService.set('_xsrf_token', 'token')
    const spyAuthService = spyOn(authService, 'logout')
    spyAuthService.and.returnValue(of({ message: 'Cierre de sesión satisfactorio.' }))
    const spyRouterNavigate = spyOn(router, 'navigate')
    spyRouterNavigate.and.returnValue(Promise.resolve(true))

    component.logout()
    expect(cookieService.get('_user_lh')).toBe('')
    expect(cookieService.get('_xsrf_token')).toBe('')
    expect(spyAuthService).toHaveBeenCalled()
    expect(spyRouterNavigate).toHaveBeenCalledWith([''])
  })

  it('should not logout, logout()', () => {
    cookieService.set('_user_lh', 'token')
    cookieService.set('_xsrf_token', 'token')
    const spyAuthService = spyOn(authService, 'logout')
    spyAuthService.and.returnValue(throwError(() => 'El usuario no está autenticado.'))
    const spyRouterNavigate = spyOn(router, 'navigate')
    spyRouterNavigate.and.returnValue(Promise.resolve(true))

    component.logout()
    expect(cookieService.get('_user_lh')).not.toBe('')
    expect(cookieService.get('_xsrf_token')).not.toBe('')
    expect(spyAuthService).toHaveBeenCalled()
    expect(spyRouterNavigate).not.toHaveBeenCalled()
  })

  it('should have responsive design', () => {
      const resposiveDesignSpy = spyOn(responsiveService, 'obtenerDispositivo')
      resposiveDesignSpy.and.returnValue(of('Dispositivo desconocido'))
      component.ngOnInit() // Ejecutamos el onInit (IMPORTANTE!! EL ONINIT NO SE LLAMA SOLO!!!)
      expect(responsiveService.obtenerDispositivo).toHaveBeenCalled()
    })
});
