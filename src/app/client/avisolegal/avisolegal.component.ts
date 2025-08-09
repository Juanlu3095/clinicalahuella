import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../partials/header/header.component";
import { FooterComponent } from "../../partials/footer/footer.component";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-avisolegal',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './avisolegal.component.html',
  styleUrl: './avisolegal.component.scss'
})
export class AvisolegalComponent implements OnInit {
  private title = inject(Title)

  ngOnInit(): void {
    this.title.setTitle('Aviso legal - Clínica veterinaria La Huella')
  }
}
