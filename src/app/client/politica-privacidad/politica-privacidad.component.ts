import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../partials/header/header.component";
import { FooterComponent } from "../../partials/footer/footer.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.scss'
})
export class PoliticaPrivacidadComponent {
  private title = inject(Title)
  
  ngOnInit(): void {
    this.title.setTitle('Política de privacidad - Clínica veterinaria La Huella')
  }
}
