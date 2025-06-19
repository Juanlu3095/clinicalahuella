import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Meta, Title } from '@angular/platform-browser';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { BookService } from '../../services/api/book.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NgxMaterialTimepickerModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDatepickerModule, ReactiveFormsModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'es-ES'}],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss'
})
export class BookComponent implements OnInit, OnDestroy{

  title = inject(Title)
  meta = inject(Meta)
  private responsive = inject(ResponsivedesignService)
  private bookService = inject(BookService)
  private matsnackbar = inject(MatSnackBar)
  rowHeight: string = ''
  subscription: Subscription = new Subscription()

  bookForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono: new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(1)])),
    fecha: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  ngOnInit(): void {
    this.title.setTitle('Reservar cita - Clínica veterinaria La Huella');
    this.meta.updateTag({ name: 'description', content: 'Reserva cita para tu mascota en nuestra clínica veterinaria de Málaga.' })
    this.meta.updateTag({ name: 'keywords', content: 'reserva cita, cita mascota, clínica málaga'})
    this.responsiveDesign();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  solicitarReserva() {
    if(this.bookForm.valid && this.bookForm.value) {
      console.log('Fecha form: ', this.bookForm.value.fecha)
      console.log('Tipo de la fecha: ', typeof(this.bookForm.value.fecha))
      const book = {
        nombre: this.bookForm.value.nombre || '',
        apellidos: this.bookForm.value.apellidos || '',
        email: this.bookForm.value.email || '',
        telefono: this.bookForm.value.telefono || undefined,
        fecha: this.bookForm.value.fecha?.toLocaleDateString('en-CA') || '', // Formato YYYY-MM-DD
        hora: this.bookForm.value.hora || '',
      }
      this.bookService.postBooking(book).subscribe({
        next: (response) => {
          this.matsnackbar.open('Reserva realizada.', 'Aceptar', {
            duration: 3000
          })
        },
        error: (error) => {
          this.matsnackbar.open('Ha ocurrido un error. Reserva no creada.', 'Aceptar', {
            duration: 3000,
          })
        }
      })
    }
  }

  responsiveDesign() {
    this.subscription = this.responsive.obtenerDispositivo().subscribe({
      next: (dispositivo) => {
        switch(dispositivo) {
          case 'Móvil':
            this.rowHeight = "4:1";
            break;
          case 'Tablet':
            this.rowHeight = "5:1";
            break;
          default:
            this.rowHeight = "6:1";
            break;
        }
      },
      error: (error) => {
        console.error(error)
      }
    })
  }
  

  // Styles for matTimePicker
  lahuellaTheme: NgxMaterialTimepickerTheme = {
    container: {
        bodyBackgroundColor: '#fff',
        buttonColor: '#ce984c'
    },
    dial: {
        dialBackgroundColor: '#ce984c',
    },
    clockFace: {
        clockFaceBackgroundColor: '#4c5462',
        clockHandColor: '#ce984c',
        clockFaceTimeInactiveColor: '#fff'
    }
  };
}
