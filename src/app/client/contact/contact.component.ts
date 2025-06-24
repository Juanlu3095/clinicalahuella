import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { MessageService } from '../../services/api/message.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, MatGridListModule, MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit, OnDestroy{

  private title = inject(Title)
  private meta = inject(Meta)
  private responsive = inject(ResponsivedesignService)
  private messageService = inject(MessageService)
  rowHeight: string = ''
  subscription: Subscription = new Subscription()
  @ViewChild('modal', {static: true} ) ventanaModal: ElementRef<HTMLElement> = {} as ElementRef

  contactForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono: new FormControl<string>('', Validators.compose([Validators.required, Validators.min(1)])),
    asunto: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    mensaje: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
  })

  constructor() {}

  ngOnInit(): void {
    this.title.setTitle('Contacto - Clínica veterinaria La Huella')
    this.meta.updateTag({ name: 'description', content: 'Formulario de contacto para nuestra clínica veterinaria de Málaga.' })
    this.meta.updateTag({ name: 'keywords', content: 'contacto, formulario contacto, málaga, clínica veterinaria málaga'})
    this.responsiveDesign()
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  enviarMensaje() {
    if(this.contactForm.valid && this.contactForm.value) {
      const message = {
        nombre: this.contactForm.value.nombre || '',
        apellidos: this.contactForm.value.apellidos || '',
        email: this.contactForm.value.email || '',
        telefono: this.contactForm.value.telefono || '',
        asunto: this.contactForm.value.asunto || '',
        mensaje: this.contactForm.value.mensaje || '',
      }

      this.messageService.postMessage(message).subscribe({
        next: (respuesta) => {
          console.log(respuesta)
          this.abrirModal()
        },
        error: (error) => {
          console.error(error)
        }
      })
    }
  }

  abrirModal(): void {
    if(this.ventanaModal.nativeElement.classList.contains('invisible')) {
      this.ventanaModal.nativeElement.classList.remove('invisible')
    }

    /* this.ventanaModal.nativeElement.onclick = (event: MouseEvent) => {
      console.log(event.target)
      console.log('Ventana modal: ', document.getElementById('modal')?.contains(event.target as HTMLElement))
    } */
  }

  cerrarModal(): void {
    if(!this.ventanaModal.nativeElement.classList.contains('invisible')) {
      this.ventanaModal.nativeElement.classList.add('invisible')
    }
  }

  responsiveDesign() {
    this.subscription = this.responsive.obtenerDispositivo().subscribe({
      next: (dispositivo) => {
        switch(dispositivo) {
          case 'Móvil':
            this.rowHeight = "4:1";
            break;
          default:
            this.rowHeight = "7:1";
            break;
        }
      },
      error: (error) => {
        console.error(error)
      }
    })
  }
}
