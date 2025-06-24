import { Component, inject, OnInit, TemplateRef, ViewChild, LOCALE_ID, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, formatDate, registerLocaleData  } from '@angular/common';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableButton } from '../../interfaces/tablebutton';
import { DatatableService } from '../../services/material/datatable.service';
import { DialogService } from '../../services/material/dialog.service';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule, NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { BookService } from '../../services/api/book.service';
import { BookingPartial } from '../../interfaces/book';
import localeEs from '@angular/common/locales/es';
import { HttpErrorResponse } from '@angular/common/http';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { Subscription } from 'rxjs';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [MatButtonModule, DatatableComponent, MatFormFieldModule, MatInputModule, MatGridListModule, NgxMaterialTimepickerModule, MatDatepickerModule, ReactiveFormsModule, CommonModule],
  providers: [provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'es-ES'}, {provide: LOCALE_ID, useValue: 'es'}],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent implements OnInit, OnDestroy{

  reservas: BookingPartial[] = []
  reserva: BookingPartial = {} as BookingPartial
  rowHeight: string = ''
  subscription: Subscription[] = []

  private reservasService = inject(BookService)
  private dialogService = inject(DialogService)
  private responsiveDesignService = inject(ResponsivedesignService)
  private readonly datatableService = inject(DatatableService)
  private matsnackbar = inject(MatSnackBar)

  columns: string[] = ['nombre', 'apellidos', 'fecha', 'hora'] // LA FECHA HAY QUE PONERLA EN DD-MM-YYYY (EN ESPAÑOL)
  displayedColumns = ['select',...this.columns, 'acciones'];
  selectedIds: string[] = [];

  public botones: TableButton[] = [
    {id: 1, nombre: 'Ver', class: 'ver', accion: (id: string) => this.modalVerReserva(id)},
    {id: 2, nombre: 'Editar', class: 'editar', accion: (id:string) => this.modalEditarReserva(id)}, // () => para poder usar this..., le pasamos la id del mensaje
    {id: 3, nombre: 'Eliminar', class: 'danger', accion: (id: string) => this.modalEliminarReserva(id)},
  ]

  @ViewChild('contentVer') modalVer!: TemplateRef<HTMLElement>;
  @ViewChild('contentNuevo') modalNuevo!: TemplateRef<HTMLElement>;
  @ViewChild('contentEditar') modalEditar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminarSeleccion') modalEliminarSeleccion!: TemplateRef<HTMLElement>;

  nuevaReservaForm = new FormGroup({
    nombre_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.min(1)])),
    fecha_nuevo: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  editarReservaForm = new FormGroup({
    nombre_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.min(1)])),
    fecha_editar: new FormControl<Date>(new Date, Validators.compose([Validators.required, Validators.minLength(4)])),
    hora_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(3)])),
  })

  ngOnInit(): void {
    this.getReservas()
    this.responsiveDesign()

    this.subscription.push(this.reservasService.refresh$.subscribe(() => {
        this.getReservas()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.forEach(item => item.unsubscribe());
  }

  getReservas () {
    this.reservasService.getAllBookings().subscribe({
      next: (respuesta) => {
        this.reservas = respuesta.data
        this.reservas.forEach((elemento) => {
          elemento.fecha = formatDate(new Date(elemento.fecha!), 'dd/MM/yyyy', 'es-ES')
        })
        
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.matsnackbar.open('Reserva no encontrada.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.matsnackbar.open('Ha ocurrido un error al buscar las reservas.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  async modalVerReserva(id: string) {
    let title: string = 'Ver reserva'; // Título del modal
    let btnCancel = 'cancelar';

    this.getReserva(id)

    await this.dialogService.openDialog({ html: this.modalVer, title: title, btnCancel: btnCancel})
  }

  getReserva(id: string) {
    this.reservasService.getBooking(id).subscribe({
      next: (respuesta) => {
        this.reserva = respuesta.data
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.matsnackbar.open('Reserva no encontrada.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.matsnackbar.open('Ha ocurrido un error al buscar la reserva.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  async modalCrearReserva() {
    let title: string = 'Nueva reserva'; // Título del modal
    let btnCancel = 'cancelar';
    let btnClass = 'guardar'

    await this.dialogService.openDialog({ html: this.modalNuevo, title, btnCancel, btnClass}).then((confirm) => {
      if (confirm) {
        this.crearReserva()
      }
    })
  }

  crearReserva() {
    if (this.nuevaReservaForm.valid) {
      const nuevaReserva: BookingPartial = {
        nombre: this.nuevaReservaForm.value.nombre_nuevo || '',
        apellidos: this.nuevaReservaForm.value.apellidos_nuevo || '',
        email: this.nuevaReservaForm.value.email_nuevo || '',
        telefono: this.nuevaReservaForm.value.telefono_nuevo || undefined,
        fecha: this.nuevaReservaForm.value.fecha_nuevo?.toLocaleDateString('en-CA') || '', // Formato YYYY-MM-DD
        hora: this.nuevaReservaForm.value.hora_nuevo || '',
      }
      this.reservasService.postBooking(nuevaReserva).subscribe({
        next: (respuesta) => {
          this.matsnackbar.open('Reserva creada.', 'Aceptar', {
            duration: 3000
          })
        },
        error: (error) => {
          this.matsnackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      })
    }
  }

  async modalEditarReserva(id: string) {
    let title: string = 'Editar reserva'; // Título del modal
    let btnCancel = 'cancelar';
    let btnClass = 'guardar'

    this.reservasService.getBooking(id).subscribe((respuesta) => {
      if(respuesta.data) {
        const fecha = respuesta.data.hora
        const hours = fecha.slice(0,2)
        const minutes = fecha.slice(3,5)
        const nuevaFecha = new Date()
        nuevaFecha.setHours(hours)
        nuevaFecha.setMinutes(minutes)
        this.editarReservaForm.patchValue({
          nombre_editar: respuesta.data.nombre,
          apellidos_editar: respuesta.data.apellidos,
          email_editar: respuesta.data.email,
          telefono_editar: respuesta.data.telefono,
          fecha_editar: new Date(respuesta.data.fecha),
          hora_editar: hours + ':' + minutes,
        })
      }
    })

    await this.dialogService.openDialog({ html: this.modalEditar, title, btnCancel, btnClass}).then((confirm) => {
      if (confirm) {
        this.editarReserva(id)
      }
    })
  }

  editarReserva (id: string) {
    if (this.editarReservaForm.valid) {
      const editarReserva: BookingPartial = {
        nombre: this.editarReservaForm.value.nombre_editar || '',
        apellidos: this.editarReservaForm.value.apellidos_editar || '',
        email: this.editarReservaForm.value.email_editar || '',
        telefono: this.editarReservaForm.value.telefono_editar || '',
        fecha: this.editarReservaForm.value.fecha_editar?.toLocaleDateString('en-CA') || '', // Formato YYYY-MM-DD
        hora: this.editarReservaForm.value.hora_editar || '',
      }
      
      this.reservasService.updateBooking(id, editarReserva).subscribe({
        next: (respuesta) => {
          this.matsnackbar.open('Reserva actualizada.', 'Aceptar', {
            duration: 3000
          })
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.matsnackbar.open('Reserva no encontrada.', 'Aceptar', {
              duration: 3000
            })
          } else {
            this.matsnackbar.open('Ha ocurrido un error.', 'Aceptar', {
              duration: 3000
            })
          }
        }
      })
    }
  }

  async modalEliminarReserva(id: string) {
    let title: string = 'Eliminar reserva'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de eliminar
    let btnCancel = 'cancelar';
    
    this.reservasService.getBooking(id).subscribe({
      next: async (respuesta) => {
        this.reserva = respuesta.data

        await this.dialogService.openDialog({html: this.modalEliminar, title, btnClass, btnCancel}).then(confirm => {
          if (confirm) {
            this.eliminarReserva(id)
          }
        })
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.matsnackbar.open('Reserva no encontrada.', 'Aceptar', {
            duration: 3000
          })
        } 
        else {
          this.matsnackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
    
    
  }

  eliminarReserva(id: string) {
    this.reservasService.deleteBooking(id).subscribe({
      next: (respuesta) => {
        this.matsnackbar.open('Reserva eliminada.', 'Aceptar', {
          duration: 3000
        })
      },
      error: (error) => {
        this.matsnackbar.open('Ha ocurrido un error.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  async modalEliminarSeleccionReservas() {
    let title: string = 'Eliminar reservas'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    await this.dialogService.openDialog({html: this.modalEliminarSeleccion, title, btnClass, btnCancel}).then(confirm => {
      if(confirm) {
        this.eliminarReservas()
      }
    })
  }

  eliminarReservas () {
    this.reservasService.deleteBookings(this.selectedIds).subscribe({
      next: (respuesta) => {
        this.matsnackbar.open('Reservas eliminadas.', 'Aceptar', {
          duration: 3000
        })
        this.datatableService._observable$.next() // Emitimos observable para reiniciar las ids
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.matsnackbar.open('Reservas no encontradas.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.matsnackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  // Método que se ejecuta cuando cambia la selección en el hijo para los checkbox
  onSelectionChange(ids: string[]) {
    this.selectedIds = ids;
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
