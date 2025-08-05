import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-cookiebanner',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './cookiebanner.component.html',
  styleUrl: './cookiebanner.component.scss'
})
export class CookiebannerComponent{
  cookieService = inject(CookieService)
  public _bottomSheetRef = inject<MatBottomSheetRef<CookiebannerComponent>>(MatBottomSheetRef); // Referencia al banner

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss(); // Se cerrará el banner al pulsar un botón
    event.preventDefault();
  }
  
  aceptarCookies() {
    localStorage.setItem('consentimiento_ga', 'true')
  }

  denegarCookies() {
    localStorage.setItem('consentimiento_ga', 'false')
    this.cookieService.delete('_ga')
    this.cookieService.delete('_ga_3ZGKXK440B')
  }
}
