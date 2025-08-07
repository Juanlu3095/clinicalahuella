import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/api/auth.service';
import { Router } from '@angular/router';
import { DialogService } from '../../services/material/dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatCardModule, MatGridListModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckbox, ReactiveFormsModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{

  btnDisabled: boolean = false; // Se usa para impedir múltiples solicitudes de login al backend 
  title = inject(Title)
  dialogService = inject(DialogService)
  cookieService = inject(CookieService)
  authService = inject(AuthService)
  snackbar = inject(MatSnackBar)
  router = inject(Router)

  loginForm = new FormGroup({
    email: new FormControl('', Validators.compose([Validators.email, Validators.required])),
    password: new FormControl('', Validators.compose([Validators.required])),
    politica: new FormControl(false, Validators.requiredTrue)
  });

  ngOnInit(): void {
    this.title.setTitle('Acceder < Clínica veterinaria La Huella')
  }

  async login () {
    this.dialogService.openSpinner()
    if(this.loginForm.valid) {
      this.btnDisabled = true
      this.authService.login(this.loginForm.value).subscribe({
        next: async (respuesta) => {
          this.btnDisabled = false
          this.dialogService.closeAll()
          // Obtenemos el nombre de usuario de la respuesta y lo guardamos en una cookie
          if(respuesta.data) {
            let expiration = new Date(Date.now() + 60 * 60 * 1000) // la expiración se establece a dentro de una hora
            this.cookieService.set(
              '_user_lh',
              respuesta.data,
              {
                expires: expiration,
                secure: true,
                sameSite: 'Strict',
              }
            )
            this.cookieService.delete('lh_xsrf_token', '/', environment.frontDomain)
          }
          await this.router.navigate(['/admin'])
        },
        error: (error: HttpErrorResponse) => {
          this.btnDisabled = false
          this.dialogService.closeAll()
          if(error.status === 401) {
            this.snackbar.open('Usuario y/o contraseña incorrectos.', 'Aceptar', {
              duration: 3000
            })
          } else {
            this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
              duration: 3000
            })
          }
        }
      })
    } else {
      this.dialogService.closeAll(); // Cerramos spinner
      this.snackbar.open('El email y/o contraseña no son válidos.', 'Aceptar', {
        duration: 3000
      });
    }
  }
}
