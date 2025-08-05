import { afterRender, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef, } from '@angular/material/bottom-sheet';
import { CookiebannerComponent } from './partials/cookiebanner/cookiebanner.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatBottomSheetModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'lahuella';
  consentimiento: string | null | undefined = ''
  private cookieBanner = inject(MatBottomSheet);
  private readonly platformId = inject(PLATFORM_ID)

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.consentimiento = localStorage.getItem('consentimiento_ga')
      if (!this.consentimiento) {
        this.openCookieBanner()
      }
    }
  }

  openCookieBanner(): void {
    this.cookieBanner.open(CookiebannerComponent, {
      panelClass: 'banner-consentimiento'
    });
  }
}
