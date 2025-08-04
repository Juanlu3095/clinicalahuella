import { Component } from '@angular/core';
import { HeaderComponent } from "../../partials/header/header.component";
import { FooterComponent } from "../../partials/footer/footer.component";

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.scss'
})
export class PoliticaPrivacidadComponent {

}
