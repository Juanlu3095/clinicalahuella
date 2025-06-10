import { Component, OnInit, afterRender, inject, PLATFORM_ID, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { NewsletterService } from '../../services/api/newsletter.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterLink, MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy{

  @ViewChild('trust') trust: HTMLElement|undefined;
  @ViewChild('newsletter') newsEnviada: ElementRef<HTMLElement> = {} as ElementRef
  private title = inject(Title)
  private meta = inject(Meta)
  private readonly platformId = inject(PLATFORM_ID)
  private newsletterService = inject(NewsletterService)

  newsletterForm = new FormGroup({
    email: new FormControl<string>('', Validators.compose([Validators.required, Validators.email, Validators.minLength(3)]))
  })

  constructor() {
    afterRender(() => {
      if(isPlatformBrowser(this.platformId)) {
        window.addEventListener("scroll", this.scrollMovement);
      }
    })
  }

  ngOnInit(): void {
    this.title.setTitle('Clínica veterinaria La Huella')
    this.meta.updateTag({ name: 'description', content: 'Consultas veterinarias para perros y gatos en nuestra clínica de Málaga.' })
    this.meta.updateTag({ name: 'keywords', content: 'clínica veterinaria, cuidado de mascotas, málaga, perro, gato' })
  }

  ngOnDestroy(): void {
    if(isPlatformBrowser(this.platformId)) {
      window.removeEventListener("scroll", this.scrollMovement); // Eliminamos el Listener para que no se ejecute en otras páginas
    }
  }

  crearNewsletter() {
    if (this.newsletterForm.valid && this.newsletterForm.value) {
      const email = {
        email: this.newsletterForm.value.email || '' // Con esto obligamos a que el form no sea null
      }
      this.newsletterService.postNewsletter(email).subscribe({
        next: (response) => {
          if(this.newsEnviada.nativeElement.classList.contains('invisible')) {
            this.newsEnviada.nativeElement.classList.remove('invisible')
          }
          if(this.newsEnviada.nativeElement.classList.contains('text-red-600')) {
            this.newsEnviada.nativeElement.classList.remove('text-red-600')
          }
          this.newsEnviada.nativeElement.textContent = '¡Inscripción enviada con éxito!'
        },
        error: (error) => {
          if(this.newsEnviada.nativeElement.classList.contains('invisible')) {
            this.newsEnviada.nativeElement.classList.remove('invisible')
          }
          if(!this.newsEnviada.nativeElement.classList.contains('text-red-600')) {
            this.newsEnviada.nativeElement.classList.add('text-red-600')
          }
          this.newsEnviada.nativeElement.textContent = 'Error al enviar tu inscripción'
        }
      })
    }
  }

  scrollMovement(){ // Todo esto se ejecutará al hacer scroll
    var trust = document.getElementById("trust"); // Seleccionamos el elemento a observar
    if(trust) {
      let box = trust!.getBoundingClientRect(); // Devuelve las coordenadas del elemento trust con respecto al viewport
      var visible = box.top < window.innerHeight && box.bottom >= 0; // Se calcula si el elemento trust es visible en el viewport
      if(visible) {
        trust!.classList.add("dchaizqa"); // Añade la clase que tiene la animación. ! Indica que trust nunca será null
      }
    }
  }
}
