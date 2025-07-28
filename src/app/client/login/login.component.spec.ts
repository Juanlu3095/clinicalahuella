import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { AuthService } from '../../services/api/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { appConfig } from '../../app.config';
import { Router } from '@angular/router';
import { DialogService } from '../../services/material/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockAuthService: {
  login: () => Observable<ApiresponsePartial>
} = {
  login: () => of({})
}

const mockAuthLoginForm = {
  email: 'pepe@gmail.com',
  password: 'pepe',
  politica: true
}

const mockIncorrectAuthLoginForm = {
  email: 'pepe',
  password: 'pepe',
  politica: true
}

const mockRouter : {
  navigate: (url: string) => Promise<boolean>
} = {
  navigate: () => Promise.resolve(true)
}

const mockDialogResponse = Promise.resolve('confirm')

const mockDialogService: {
  openDialog: () => Promise<any>,
  openSpinner: () => void,
  closeAll: () => void
} = {
  openDialog: () => Promise.resolve('confirm'),
  openSpinner: () => {},
  closeAll: () => {}
}

// Creamos un espia con createSpyObj en lugar de spyOn porque no tenemos una instancia de MatSnackBar, Angular la crea y la inyecta directamente
const mockSnackbar = jasmine.createSpyObj(['open']); // Creamos un objeto sin nombre ni clase, sólo con la propiedad 'open', la cual espia al metodo open() de MatSnackBar

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let cookieService: CookieService;
  let router: Router;
  let dialogService: DialogService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [...appConfig.providers,
        { provider: AuthService, useValue: mockAuthService },
        CookieService,
        { provider: Router, useValue: mockRouter },
        { provider: DialogService, useValue: mockDialogService },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService)
    cookieService = TestBed.inject(CookieService)
    router = TestBed.inject(Router)
    dialogService = TestBed.inject(DialogService)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log in an user, login()', async () => {
    cookieService.set('_xsrf_token', 'xsrf')
    const spyAuthService = spyOn(authService, 'login')
    spyAuthService.and.returnValue(of({ message: 'Usuario y contraseña correctos.', data: 'Pepe González' }))
    const spyRouterNavigate = spyOn(router, 'navigate')
    spyRouterNavigate.and.returnValue(Promise.resolve(true))
    const spySpinner = spyOn(dialogService, 'openSpinner')
    const spyCloseAll = spyOn(dialogService, 'closeAll')

    expect(component.btnDisabled).toBeFalse()
    component.loginForm.patchValue(mockAuthLoginForm)
    await component.login()

    expect(spySpinner).toHaveBeenCalled()
    expect(component.btnDisabled).toBeFalse()
    expect(spyCloseAll).toHaveBeenCalled()
    expect(cookieService.get('_user_lh')).toBe('Pepe González')
    expect(cookieService.get('_xsrf_token')).toBe('')
    expect(spyRouterNavigate).toHaveBeenCalledWith(['/admin'])
  })

  it('should not log in an user, login()', async () => {
    // Error 401
    cookieService.delete('_user_lh')
    cookieService.set('_xsrf_token', 'xsrf')
    const spyAuthService = spyOn(authService, 'login')
    spyAuthService.and.returnValue(throwError(() => ({
      status: 401,
      message: 'Usuario y/o contraseña incorrectos.'
    })))
    const spyRouterNavigate = spyOn(router, 'navigate')
    spyRouterNavigate.and.returnValue(Promise.resolve(true))
    const spySpinner = spyOn(dialogService, 'openSpinner')
    const spyCloseAll = spyOn(dialogService, 'closeAll')

    expect(component.btnDisabled).toBeFalse()
    component.loginForm.patchValue(mockAuthLoginForm)
    await component.login()

    expect(spySpinner).toHaveBeenCalled()
    expect(component.btnDisabled).toBeFalse()
    expect(cookieService.get('_user_lh')).toBe('')
    expect(cookieService.get('_xsrf_token')).not.toBe('')
    expect(spyCloseAll).toHaveBeenCalled()
    expect(spyRouterNavigate).not.toHaveBeenCalled()
    expect(mockSnackbar.open).toHaveBeenCalledWith('Usuario y/o contraseña incorrectos.', 'Aceptar', { duration: 3000 })

    // Error 500
    spyAuthService.and.returnValue(throwError(() => ({
      status: 500,
      message: 'Ha ocurrido un error.'
    })))
    await component.login()

    expect(mockSnackbar.open).toHaveBeenCalledWith('Ha ocurrido un error.', 'Aceptar', { duration: 3000 })

    // DATOS NO VÁLIDOS
    component.loginForm.patchValue(mockIncorrectAuthLoginForm)
    await component.login()
    expect(mockSnackbar.open).toHaveBeenCalledWith('El email y/o contraseña no son válidos.', 'Aceptar', { duration: 3000 })
  })
});
