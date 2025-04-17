import { afterRender, Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { Subscription } from 'rxjs';

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
  open: boolean =  true; // Para abrir o no el sidenav.
  mode: MatDrawerMode = 'side'; // Para señalar cómo mostrar el sidenav, si como side, over o push.
  sidenavWidth: number = 15; // Para dar un ancho al sidenav.
  private responsiveDesignService = inject(ResponsivedesignService)

  constructor() {
   /*  afterRender(() => {
      if(isPlatformBrowser(this.platformId)) {
          alert(location.href);
        }
    }) */
  }
  ngOnInit(): void {
    console.log('Has cambiado de página') // Sólo se está ejecutando una vez
    this.disenoResponsivo()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
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
