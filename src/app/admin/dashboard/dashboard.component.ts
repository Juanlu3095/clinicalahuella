import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/api/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatMenuModule, MatIcon, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy{

  private readonly platformId = inject(PLATFORM_ID)
  subscription: Subscription = new Subscription;
  dispositivo: string = ''; // Para indicar en el HTML el dispositivo usado.
  user: string = ''
  open: boolean =  true; // Para abrir o no el sidenav.
  mode: MatDrawerMode = 'side'; // Para señalar cómo mostrar el sidenav, si como side, over o push.
  sidenavWidth: number = 15; // Para dar un ancho al sidenav.
  private responsiveDesignService = inject(ResponsivedesignService)
  private authService = inject(AuthService)
  private cookieService = inject(CookieService)
  private router = inject(Router)

  ngOnInit(): void {
    this.getUser()
    this.disenoResponsivo()
    console.log('Has cambiado de página') // Sólo se está ejecutando una vez, sólo cuando se refresca la página 
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  getUser() {
    this.user = this.cookieService.get('_user_lh')
  }

  logout () {
    this.authService.logout().subscribe({
      next: (respuesta) => {
        this.cookieService.delete('_user_lh')
        this.cookieService.delete('_xsrf_token')
        this.cookieService.delete('lh_xsrf_token', '/', environment.frontDomain)
        this.router.navigate([''])
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  disenoResponsivo() {
    this.subscription = this.responsiveDesignService.obtenerDispositivo().subscribe((dispositivo) => {
      switch(dispositivo) {
        case 'Portátil':
        case 'Escritorio':
          this.dispositivo = dispositivo;
          this.open = true;
          this.mode = 'side';
          this.sidenavWidth = 18;
          break;
        case 'Tablet':
          this.dispositivo = dispositivo;
          this.open = false;
          this.mode = 'over';
          this.sidenavWidth = 50;
          break;
        case 'Móvil':
          this.dispositivo = dispositivo;
          this.open = false;
          this.mode = 'over';
          this.sidenavWidth = 80;
          break;
        default:
          break;
      }
    })
  }
}
