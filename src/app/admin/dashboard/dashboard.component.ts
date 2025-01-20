import { afterRender, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, MatMenuModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{

  private readonly platformId = inject(PLATFORM_ID)

  constructor() {
   /*  afterRender(() => {
      if(isPlatformBrowser(this.platformId)) {
          alert(location.href);
        }
    }) */
  }
  ngOnInit(): void {
    console.log('Has cambiado de página') // Sólo se está ejecutando una vez
  }
}
