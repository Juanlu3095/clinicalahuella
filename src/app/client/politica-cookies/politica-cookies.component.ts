import { Component, inject } from '@angular/core';
import { HeaderComponent } from "../../partials/header/header.component";
import { FooterComponent } from "../../partials/footer/footer.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-politica-cookies',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './politica-cookies.component.html',
  styleUrl: './politica-cookies.component.scss'
})
export class PoliticaCookiesComponent {
  private title = inject(Title)
  
  ngOnInit(): void {
    this.title.setTitle('Política de cookies - Clínica veterinaria La Huella')
  }
}
