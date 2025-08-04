import { Component } from '@angular/core';
import { HeaderComponent } from "../../partials/header/header.component";
import { FooterComponent } from "../../partials/footer/footer.component";

@Component({
  selector: 'app-avisolegal',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './avisolegal.component.html',
  styleUrl: './avisolegal.component.scss'
})
export class AvisolegalComponent {

}
