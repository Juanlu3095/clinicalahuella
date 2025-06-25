import { Component, inject, OnInit, PLATFORM_ID, LOCALE_ID, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule, registerLocaleData, formatDate } from '@angular/common';
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
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookingPartial } from '../../interfaces/book';
import { BookService } from '../../services/api/book.service';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { TableButton } from '../../interfaces/tablebutton';
import { Title } from '@angular/platform-browser';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [DatatableComponent, CommonModule, ReactiveFormsModule, FullCalendarModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatGridListModule, NgxMaterialTimepickerModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'es-ES'}, {provide: LOCALE_ID, useValue: 'es'}],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.scss'
})
export class CitasComponent implements OnInit, OnDestroy {

  citas: Appointment[] = []
  cita: Appointment = {} as Appointment
  eventos: EventInput[] = []
  reservas: BookingPartial[] = []
  private citasService = inject(AppointmentService)
  private reservasService = inject(BookService)
  private responsiveDesignService = inject(ResponsivedesignService)
  public readonly platformId = inject(PLATFORM_ID) // Se usa esto en el HTML para que el calendario sólo cargue cuando el renderizado ya se haya realizado con SSR
  public dialogService = inject(DialogService)
  private matsnackbar = inject(MatSnackBar)
  title = inject(Title)
  subscription: Subscription[] = []
  rowHeight: string = ''

  // Tabla reservas
  columns: string[] = ['nombre', 'apellidos', 'fecha', 'hora'] // LA FECHA HAY QUE PONERLA EN DD-MM-YYYY (EN ESPAÑOL)
  displayedColumns = [...this.columns, 'acciones'];

  public botones: TableButton[] = [
    {id: 1, nombre: 'Añadir', class: 'ver', accion: (id: string) => this.crearReservaCita(id)}
  ]

  @ViewChild('contentVer') modalVer!: TemplateRef<HTMLElement>;
  @ViewChild('contentNuevo') modalNuevo!: TemplateRef<HTMLElement>;
  @ViewChild('contentEditar') modalEditar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;
  @ViewChild('contentReservaCita') modalReservaCita!: TemplateRef<HTMLElement>;

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
    telefono_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.min(1)])),
    fecha_nuevo: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  editarCitaForm = new FormGroup({
    nombre_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.min(1)])),
    fecha_editar: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  ngOnInit(): void {
    this.title.setTitle('Citas < Clínica veterinaria La Huella')
    this.getCitas()
    this.responsiveDesign() 
    
    this.subscription.push(this.citasService.refresh$.subscribe(() => {
        this.getCitas()
      })
    )

    this.subscription.push(this.reservasService.refresh$.subscribe(() => {
        this.getReservas()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.forEach(item => item.unsubscribe());
  }

  getCitas () { // Al crear evento o borrarlo, no ve las actualizaciones al llamar a la api
    this.citasService.getAllAppointments().subscribe({
      next: (respuesta) => {
        this.citas = respuesta.data
        this.eventos = []
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
      },
      error: (error) => {
        this.matsnackbar.open('No se ha podido obtener las citas.', 'Aceptar', {
          duration: 3000
        })
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
        telefono: this.nuevaCitaForm.value.telefono_nuevo || '',
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
          this.matsnackbar.open('No se ha podido crear la cita.', 'Aceptar', {
            duration: 3000
          })
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
        telefono_editar: cita?.telefono,
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
          this.matsnackbar.open('Cita no actualizada.', 'Aceptar', {
            duration: 3000
          })
        }
      })
    }
  }

  async modalEliminarCita(id: string) {
    let title: string = 'Eliminar cita'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de eliminar
    let btnCancel = 'cancelar';
    
    await this.dialogService.openDialog({html: this.modalEliminar, title, btnClass, btnCancel}).then(confirm => {
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
          this.matsnackbar.open('Cita no encontrada.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  // Método para ver las reservas de los clientes que se pueden añadir a las citas
  async modalAgregarReservaCita () {
    let title: string = 'Crear cita desde reserva'; // Título del modal
    let btnCancel = 'cancelar';

    this.getReservas()
    await this.dialogService.openDialog({html: this.modalReservaCita, title, btnCancel})
  }

  // Obtiene todas las reservas para añadirla a una tabla con un botón para añadirla a las citas
  getReservas() {
    this.reservasService.getAllBookings().subscribe({
      next: (respuesta) => {
        this.reservas = respuesta.data
        this.reservas.forEach((elemento) => {
          elemento.fecha = formatDate(new Date(elemento.fecha!), 'dd/MM/yyyy', 'es-ES')
        })
      },
      error: (error) => {
        this.matsnackbar.open('No se ha podido obtener las reservas.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  // Elimina la reserva, que se usa cuando se añade una reserva a las citas correctamente
  eliminarReserva(id: string) {
    this.reservasService.deleteBooking(id).subscribe({
      error: (error) => {
        this.matsnackbar.open('No se ha eliminado la reserva al crear la cita.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  // Método para agregar una reserva a las citas
  crearReservaCita(id: string) {
    let reserva = this.reservas.find((reserva) => reserva.id == id)
    const [dia, mes, año] = reserva!.fecha!.split("/"); // Obtenemos dia mes y año separando por '/'
    let fechaConvertida = `${año}/${mes}/${dia}` // Modificamos el formato de la fecha para introducirla en las citas
    
    if (reserva) {
      let nuevaCita: AppointmentPartial = {
        nombre: reserva.nombre || '',
        apellidos: reserva.apellidos || '',
        email: reserva.email || '',
        telefono: reserva.telefono || '',
        fecha: new Date(fechaConvertida).toLocaleDateString('en-CA') || '', // Formato YYYY-MM-DD
        hora: reserva.hora || '',
      }
      this.citasService.postAppointment(nuevaCita).subscribe({
        next: (respuesta) => {
          this.matsnackbar.open('Cita creada.', 'Aceptar', {
            duration: 3000
          })
          this.eliminarReserva(id)
        },
        error: (error) => {
          this.matsnackbar.open('No se ha podido crear la cita.', 'Aceptar', {
            duration: 3000
        })
        }
      })
    }
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
