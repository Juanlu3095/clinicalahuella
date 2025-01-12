import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Title } from '@angular/platform-browser';
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

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NgxMaterialTimepickerModule, MatGridListModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatDatepickerModule, ReactiveFormsModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'es-ES'}],
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss'
})
export class BookComponent implements OnInit, OnDestroy{

  private title = inject(Title)
  private responsive = inject(ResponsivedesignService)
  rowHeight: string = ''
  subscription: Subscription = new Subscription()

  bookForm = new FormGroup({
    nombre: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono: new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(1)])),
    fecha: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(4)])),
    hora: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  ngOnInit(): void {
    this.title.setTitle('Reservar cita - Clínica veterinaria La Huella');
    this.responsiveDesign();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  solicitarReserva() {
    if(this.bookForm.valid) {
      console.log(this.bookForm.value)
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
