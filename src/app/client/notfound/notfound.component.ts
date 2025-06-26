import { Component, inject, OnInit, LOCALE_ID } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, ActivatedRoute, UrlSegment } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Title } from '@angular/platform-browser';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterLink, MatButtonModule],
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss'
})
export class NotfoundComponent implements OnInit{
  // Obtener lo que el usuario busca y ponerlo en el cartel de se busca
  title = inject(Title)
  activatedRoute = inject(ActivatedRoute)
  urls: UrlSegment[] = []
  nombrePerro: string = ''
  fecha: Date = new Date

  ngOnInit(): void {
    this.title.setTitle('Página no encontrada - Clínica veterinaria La Huella')
    this.obtenerNombrePerro()
    this.obtenerFecha()
  }

  obtenerNombrePerro(): void {
    this.activatedRoute.url.subscribe((url) => this.urls = url)
    if(this.urls.length > 1) {
      this.urls.forEach(item => this.nombrePerro = this.nombrePerro + `${item}/`)
    } else {
      this.nombrePerro = this.urls[0].toString()
    }
  }

  obtenerFecha() {
    let fecha = new Date()
    this.fecha = fecha
  }
}
