import { Component } from '@angular/core';
import { HeaderComponent } from "../../partials/header/header.component";
import { FooterComponent } from "../../partials/footer/footer.component";

@Component({
  selector: 'app-politica-cookies',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './politica-cookies.component.html',
  styleUrl: './politica-cookies.component.scss'
})
export class PoliticaCookiesComponent {

}
