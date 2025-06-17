import { Component, inject, OnInit, PLATFORM_ID, LOCALE_ID, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule, registerLocaleData  } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Appointment, AppointmentPartial } from '../../interfaces/appointment';
import { AppointmentService } from '../../services/api/appointment.service';
import { DialogService } from '../../services/material/dialog.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { MatSnackBar } from '@angular/material/snack-bar';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FullCalendarModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatGridListModule, NgxMaterialTimepickerModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'es-ES'}, {provide: LOCALE_ID, useValue: 'es'}],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.scss'
})
export class CitasComponent implements OnInit, OnDestroy {

  citas: Appointment[] = []
  cita: Appointment = {} as Appointment
  eventos: EventInput[] = []
  private citasService = inject(AppointmentService)
  private responsiveDesignService = inject(ResponsivedesignService)
  public readonly platformId = inject(PLATFORM_ID) // Se usa esto en el HTML para que el calendario sólo cargue cuando el renderizado ya se haya realizado con SSR
  public dialogService = inject(DialogService)
  private matsnackbar = inject(MatSnackBar)
  subscription: Subscription[] = []
  rowHeight: string = ''

  @ViewChild('contentVer') modalVer!: TemplateRef<HTMLElement>;
  @ViewChild('contentNuevo') modalNuevo!: TemplateRef<HTMLElement>;
  @ViewChild('contentEditar') modalEditar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: false,
    locale: esLocale,
    events: this.eventos,
    eventClick: (data: EventClickArg) => {this.verEvento(data.event.id)}
  }

  nuevaCitaForm = new FormGroup({
    nombre_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_nuevo: new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(1)])),
    fecha_nuevo: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  editarCitaForm = new FormGroup({
    nombre_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_editar: new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(1)])),
    fecha_editar: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  ngOnInit(): void {
    this.getCitas()
    this.responsiveDesign() 
    
    this.subscription.push(this.citasService.refresh$.subscribe(() => {
        this.eventos = []
        this.getCitas()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.forEach(item => item.unsubscribe());
  }

  getCitas () { // Al crear evento o borrarlo, no ve las actualizaciones al llamar a la api
    this.citasService.getAllAppointments().subscribe({
      next: (respuesta) => {
        console.log(respuesta)
        this.citas = respuesta.data
        this.citas.forEach((cita) => {
          let fechaCita = new Date(cita.fecha).toLocaleDateString('es', {year: 'numeric', month: '2-digit', day: '2-digit'}) // El 2º parámetro es el de las opciones
          let fecha = fechaCita.replace(/\//g, '-').split('-').reverse().join('-') // Le damos la vuelta al string de Date
          this.eventos.push({
            id: cita.id,
            title: cita.nombre + ' ' + cita.apellidos,
            start: fecha
          })
        })
        this.calendarOptions.events = this.eventos
        console.log('Eventos: ', this.eventos)
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  // ABRIR UNA VENTANA MODAL DEL COMPONENTE CON LAS OPCIONES EDITAR Y ELIMINAR. EL DIALOG TENDRÁ EL ACTION DE CANCEL SÓLO Y DENTRO LOS BOTONES PARA EDITAR Y ELIMINAR
  async verEvento (id: string) {
    let title: string = 'Ver cita'; // Título del modal

    this.getCita(id)

    await this.dialogService.openDialog({ html: this.modalVer, title: title })
  }

  getCita(id: string) {
    this.citasService.getAppointment(id).subscribe({
      next: (respuesta) => {
        console.log(respuesta)
        this.cita = respuesta.data[0]
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.matsnackbar.open('Cita no encontrada.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  async modalCrearCita() {
    let title: string = 'Nueva cita'; // Título del modal
    let btnCancel = 'cancelar';
    let btnClass = 'guardar'

    await this.dialogService.openDialog({ html: this.modalNuevo, title, btnCancel, btnClass}).then((confirm) => {
      if (confirm) {
        this.crearCita()
      }
    })
  }

  crearCita() {
    if (this.nuevaCitaForm.valid) {
      const nuevaCita: AppointmentPartial = {
        nombre: this.nuevaCitaForm.value.nombre_nuevo || '',
        apellidos: this.nuevaCitaForm.value.apellidos_nuevo || '',
        email: this.nuevaCitaForm.value.email_nuevo || '',
        telefono: this.nuevaCitaForm.value.telefono_nuevo || undefined,
        fecha: this.nuevaCitaForm.value.fecha_nuevo?.toLocaleDateString('en-CA') || '', // Formato YYYY-MM-DD
        hora: this.nuevaCitaForm.value.hora_nuevo || '',
      }
      this.citasService.postAppointment(nuevaCita).subscribe({
        next: (respuesta) => {
          this.matsnackbar.open('Cita creada.', 'Aceptar', {
            duration: 3000
          })
        },
        error: (error) => {
          console.error(error)
        }
      })
    }
  }

  async modalEditarCita(id: string) {
    let title: string = 'Editar cita'; // Título del modal
    let btnCancel = 'cancelar';
    let btnClass = 'guardar'

    let cita = this.citas.find((cita) => cita.id == id)

    if(cita) {
      const fecha = cita.hora
      const hours = fecha.slice(0,2)
      const minutes = fecha.slice(3,5)
      const nuevaFecha = new Date()
      nuevaFecha.setHours(Number(hours))
      nuevaFecha.setMinutes(Number(minutes))
  
      this.editarCitaForm.patchValue({
          nombre_editar: cita?.nombre,
          apellidos_editar: cita?.apellidos,
          email_editar: cita?.email,
          telefono_editar: Number(cita?.telefono),
          fecha_editar: cita?.fecha ? new Date(cita.fecha) : new Date,
          hora_editar: hours + ':' + minutes,
        })
  
      await this.dialogService.openDialog({ html: this.modalEditar, title, btnCancel, btnClass}).then((confirm) => {
        if (confirm) {
          this.editarCita(id)
        }
      })

    }
  }

  editarCita(id: string) {
    if(this.editarCitaForm.valid) {
      const appointment = {
        nombre: this.editarCitaForm.value.nombre_editar || '',
        apellidos: this.editarCitaForm.value.apellidos_editar || '',
        email: this.editarCitaForm.value.email_editar || '',
        telefono: this.editarCitaForm.value.telefono_editar || undefined,
        fecha: this.editarCitaForm.value.fecha_editar?.toLocaleDateString('en-CA') || '', // Formato YYYY-MM-DD
        hora: this.editarCitaForm.value.hora_editar || '',
      }
      this.citasService.updateAppointment(id, appointment).subscribe({
        next: (respuesta) => {
          this.matsnackbar.open('Cita actualizada.', 'Aceptar', {
            duration: 3000
          })
          this.dialogService.closeAll()
        },
        error: (error) => {
          console.error(error)
        }
      })
    }
  }

  modalEliminarCita(id: string) {
    let title: string = 'Eliminar cita'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de eliminar
    let btnCancel = 'cancelar';
    
    this.dialogService.openDialog({html: this.modalEliminar, title, btnClass, btnCancel}).then(confirm => {
      if (confirm) {
        this.eliminarCita(id)
      }
    })
  }

  eliminarCita(id: string) {
    this.citasService.deleteAppointment(id).subscribe({
      next: (respuesta) => {
        this.matsnackbar.open('Cita eliminada.', 'Aceptar', {
          duration: 3000
        })
        this.dialogService.closeAll()
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {

        }
        console.error(error)
      }
    })
  }

  // Diseño responsivo
  responsiveDesign() {
    this.subscription.push(this.responsiveDesignService.obtenerDispositivo().subscribe({
      next: (dispositivo) => {
        switch(dispositivo) {
          case 'Móvil':
            this.rowHeight = "3:1";
            break;
          case 'Tablet':
            this.rowHeight = "4:1";
            break;
          default:
            this.rowHeight = "8:1";
            break;
        }
      },
      error: (error) => {
        console.error(error)
      }
    })
    )
  }

  // Styles for matTimePicker
  lahuellaTheme: NgxMaterialTimepickerTheme = {
    container: {
        bodyBackgroundColor: '#fff',
        buttonColor: '#ce984c',
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
