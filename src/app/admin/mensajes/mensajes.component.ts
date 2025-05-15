import { Component, inject, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { MessageService } from '../../services/api/message.service';
import { DialogService } from '../../services/material/dialog.service';
import { Message, MessagePartial } from '../../interfaces/message';
import { Subscription } from 'rxjs';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { TableButton } from '../../interfaces/tablebutton';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatatableService } from '../../services/material/datatable.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [DatatableComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule, ReactiveFormsModule, FormsModule],
  templateUrl: './mensajes.component.html',
  styleUrl: './mensajes.component.scss'
})
export class MensajesComponent implements OnInit, OnDestroy{

  private mensajeService = inject(MessageService)
  private snackbar = inject(MatSnackBar)
  private datatableService = inject(DatatableService)
  private dialogService = inject(DialogService)
  public mensajes: Message[] = []
  public mensaje: Message = {} as Message // variable para el modal con el que eliminar el mensaje
  public mensajeVer: Message = {} as Message // variable para el modal con el que ver el mensaje
  columns: string[] = ['nombre', 'apellidos', 'asunto', 'fecha']
  displayedColumns = ['select',...this.columns, 'acciones'];
  selectedIds: string[] = [];
  suscripcion: Subscription = new Subscription();

  public botones: TableButton[] = [
    {id: 1, nombre: 'Ver', class: 'ver', accion: (id:string) => this.modalVerMensaje(id)},
    {id: 2, nombre: 'Editar', class: 'editar', accion: (id:string) => this.modalUpdateMensaje(id) }, // () => para poder usar this..., le pasamos la id del mensaje
    {id: 3, nombre: 'Eliminar', class: 'danger', accion: (id: string) => this.modalDeleteMensaje(id)},
  ]

  @ViewChild('contentVer') modalVer!: TemplateRef<HTMLElement>;
  @ViewChild('contentNuevo') modalNuevo!: TemplateRef<HTMLElement>;
  @ViewChild('contentEditar') modalEditar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminarSeleccion') modalEliminarSeleccion!: TemplateRef<HTMLElement>;

  crearMensajeForm = new FormGroup({
    nombre_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_nuevo: new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(1)])),
    asunto_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    mensaje_nuevo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
  });

  editarMensajeForm = new FormGroup({
    nombre_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    apellidos_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    email_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1), Validators.email])),
    telefono_editar: new FormControl<number | null>(null, Validators.compose([Validators.required, Validators.min(1)])),
    asunto_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    mensaje_editar: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
  });

  ngOnInit(): void {
    this.getMensajes()

    this.suscripcion = this.mensajeService.refresh$.subscribe(() => {
      this.getMensajes()
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe()
  }

  getMensajes(): void { // LA PRIMERA FECHA SALE 'INVALID DATE', FALTA OPCIÓN VER MENSAJE
    this.mensajeService.getMessages().subscribe({
      next: (respuesta) => {
        // Convertimos el created_at
        respuesta.data.forEach((mensaje: { created_at: string; }) => {
          mensaje.created_at = new Date(mensaje.created_at).toLocaleString()
        })

        let mensajesFormateados = [...respuesta.data] // Hacemos una copia de respuesta.data y lo guardamos en un array
        mensajesFormateados = mensajesFormateados.map(message => {
          const { id, nombre, apellidos, email, telefono, asunto, mensaje, created_at } = message // Obtenemos las propiedades (key + value) a través de la desestructuración
          return { // Devolvemos un nuevo array
            id,
            nombre,
            apellidos,
            email,
            telefono,
            asunto,
            mensaje,
            fecha: created_at // cambiamos la propiedad a 'fecha' y le asignamos los valores que tenía created_at
          }
        })
        this.mensajes = mensajesFormateados
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('Categorías no encontradas.', 'Aceptar', {
            duration: 3000
          })
        } else {
          console.error(error)
        }
      }
    })
  }

  async modalVerMensaje(id: string) {
    let title: string = 'Ver mensaje'; // Título del modal
    let btnCancel = 'cancelar';

    this.getMensaje(id)

    await this.dialogService.openDialog({ html: this.modalVer, title: title, btnCancel: btnCancel})
  }

  getMensaje(id: string) {
    this.mensajeService.getMessage(id).subscribe({
      next: (respuesta) => {
        this.mensajeVer = respuesta.data
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('Mensaje no encontrado.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
          duration: 3000
        })
        }
      }
    })
  }

  modalPostMensaje() {
    let title: string = 'Nuevo mensaje'; // Título del modal
    let btnClass = 'guardar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.dialogService.openDialog({html: this.modalNuevo, title, btnClass, btnCancel}).then(confirm => {
      if(confirm && this.crearMensajeForm.valid) {
        this.postMensaje()
      }
    })
  }

  postMensaje() {
    let mensaje = {
      nombre: this.crearMensajeForm.value.nombre_nuevo || '',
      apellidos: this.crearMensajeForm.value.apellidos_nuevo || '',
      email: this.crearMensajeForm.value.email_nuevo || '',
      telefono: this.crearMensajeForm.value.telefono_nuevo || 0,
      asunto: this.crearMensajeForm.value.asunto_nuevo || '',
      mensaje: this.crearMensajeForm.value.mensaje_nuevo || '',
    }
    this.mensajeService.postMessage(mensaje).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Mensaje creado.', 'Aceptar', {
          duration: 3000
        })
      }, error: (error: HttpErrorResponse) => {
        if(error.status === 422) {
          this.snackbar.open('Los datos enviados no son correctos.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  modalUpdateMensaje(id: string) {
    let title: string = 'Editar mensaje'; // Título del modal
    let btnClass = 'guardar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.mensajeService.getMessage(id).subscribe({
      next: (respuesta) => {
        this.editarMensajeForm.patchValue({
          nombre_editar: respuesta.data.nombre,
          apellidos_editar: respuesta.data.apellidos,
          email_editar: respuesta.data.email,
          telefono_editar: respuesta.data.telefono,
          asunto_editar: respuesta.data.asunto,
          mensaje_editar: respuesta.data.mensaje
        })
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('Mensaje no encontrado.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })

    this.dialogService.openDialog({html:this.modalEditar, title, btnClass, btnCancel}).then(confirm => {
      if(confirm && this.editarMensajeForm.valid) {
        this.updateMensaje(id)
      }
    })
  }

  updateMensaje(id: string) {
    let mensaje = {
      nombre: this.editarMensajeForm.value.nombre_editar || '',
      apellidos: this.editarMensajeForm.value.apellidos_editar || '',
      email: this.editarMensajeForm.value.email_editar || '',
      telefono: this.editarMensajeForm.value.telefono_editar || 0,
      asunto: this.editarMensajeForm.value.asunto_editar || '',
      mensaje: this.editarMensajeForm.value.mensaje_editar || '',
    }
    this.mensajeService.updateMessage(id, mensaje).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Mensaje actualizado.', 'Aceptar', {
          duration: 3000
        })
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('Mensaje no encontrado.', 'Aceptar', {
            duration: 3000
          })
        }
        else if(error.status === 422) {
          this.snackbar.open('Los datos enviados no son correctos.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  modalDeleteMensaje(id: string) {
    let title: string = 'Eliminar mensaje'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de eliminar
    let btnCancel = 'cancelar';

    this.mensajeService.getMessage(id).subscribe({
      next: (respuesta) => {
        this.mensaje = respuesta.data
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('Mensaje no encontrado.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
          duration: 3000
        })
        }
      }
    })

    this.dialogService.openDialog({html: this.modalEliminar, title, btnClass, btnCancel}).then(confirm => {
      if (confirm) {
        this.deleteMensaje(id)
      }
    })
  }

  deleteMensaje(id: string) {
    this.mensajeService.deleteMessage(id).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Mensaje eliminado.', 'Aceptar', {
            duration: 3000
        })
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404 ) {
          this.snackbar.open('Mensaje no encontrado.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
            duration: 3000
          })
        }
      }
    })
  }

  modalDeleteSeleccionMensajes() {
    let title: string = 'Eliminar mensajes'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.dialogService.openDialog({html: this.modalEliminarSeleccion, title, btnClass, btnCancel}).then(confirm => {
      if(confirm) {
        this.deleteMensajes()
      }
    })
  }

  deleteMensajes() {
    this.mensajeService.deleteMessages(this.selectedIds).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Mensajes eliminados.', 'Aceptar', {
          duration: 3000
        })
        this.datatableService._observable$.next() // Emitimos observable para reiniciar las ids
      },
      error: (error: HttpErrorResponse) => {
        console.error(error) // MODIFICAR API PARA ELIMINAR MENSAJES SELECCIONADOS
      }
    })
  }

  // Método que se ejecuta cuando cambia la selección en el hijo para los checkbox
  onSelectionChange(ids: string[]) {
    this.selectedIds = ids;
  }
}
