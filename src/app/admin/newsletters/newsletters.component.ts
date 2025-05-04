import { Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableButton } from '../../interfaces/tablebutton';
import { Newsletter } from '../../interfaces/newsletter';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { NewsletterService } from '../../services/api/newsletter.service';
import { DatatableService } from '../../services/material/datatable.service';
import { DialogService } from '../../services/material/dialog.service';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-newsletters',
  standalone: true,
  imports: [MatButtonModule, DatatableComponent, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './newsletters.component.html',
  styleUrl: './newsletters.component.scss'
})
export class NewslettersComponent implements OnInit, OnDestroy{

  private newsletterService = inject(NewsletterService)
  private snackbar = inject(MatSnackBar)
  private datatableService = inject(DatatableService)
  private dialogService = inject(DialogService)
  public newsletters: Newsletter[] = []
  public newsletter: Newsletter = {} as Newsletter
  columns: string[] = ['email', 'fecha']
  displayedColumns = ['select',...this.columns, 'acciones'];
  selectedIds: string[] = []; // Parece que cuando se eliminan ids y se vuelve a seleccionar otros, los antiguos siguen aquí!!!
  suscripcion: Subscription = new Subscription();
  
  public botones: TableButton[] = [
    {id: 1, nombre: 'Editar', class: 'editar', accion: (id:string) => this.modalEditarNewsletter(id) }, // () => para poder usar this..., le pasamos la id del mensaje
    {id: 2, nombre: 'Eliminar', class: 'danger', accion: (id: string) => this.modalDeleteNewsletter(id)},
  ]

  @ViewChild('contentNuevo') modalNuevo!: TemplateRef<HTMLElement>;
  @ViewChild('contentEditar') modalEditar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminarSeleccion') modalEliminarSeleccion!: TemplateRef<HTMLElement>;

  crearNewsForm = new FormGroup({
    email_nuevo: new FormControl('', Validators.compose([Validators.required, Validators.email]))
  })

  editarNewsForm = new FormGroup({
    email_editar: new FormControl('', Validators.compose([Validators.required, Validators.email]))
  })

  constructor() {}

  ngOnInit(): void {
    this.getNewsletters()

    this.suscripcion = this.newsletterService.refresh$.subscribe(() => {
      this.getNewsletters()
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe()
  }

  getNewsletters() {
    this.newsletterService.getNewsletters().subscribe({
      next: (respuesta: ApiresponsePartial) => {
        respuesta.data.forEach((newsletter: { created_at: string; }) => {
          newsletter.created_at = new Date(newsletter.created_at).toLocaleString()
        }); // Comprobar si al crear alguna newsletter sigue poniendo bien la fecha en la tabla

        let newslettersFormateadas = [...respuesta.data] // Hacemos una copia de respuesta.data y lo guardamos en un array
        newslettersFormateadas = newslettersFormateadas.map(newsletter => {
          const { id, email, created_at } = newsletter // Obtenemos las propiedades (key + value) a través de la desestructuración
          return { // Devolvemos un nuevo array
            id,
            email,
            fecha: created_at // cambiamos la propiedad a 'fecha' y le asignamos los valores que tenía created_at
          }
        })
        this.newsletters = newslettersFormateadas // Asignamos el array a this.newsletters para el HTML
      },
      error: (error: HttpErrorResponse) => {
        this.snackbar.open('No se han podido obtener las newsletters.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  // Permite abrir modal para crear newsletter
  modalCrearNewsletter() {
    let title: string = 'Nueva suscripción'; // Título del modal
    let btnClass = 'guardar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    // Intentar que no cierre al pulsar en confirmar y no sea correcto el input
    // Mostrar error si el input es incorrecto
    this.dialogService.openDialog(this.modalNuevo, title, btnClass, btnCancel).then(confirm => {
      if(confirm && this.crearNewsForm.valid) {
        this.crearNewsletter()
      }
    })
  }

  // Permite crear la newsletter
  crearNewsletter() {
    let newsletter = {
      email: this.crearNewsForm.value.email_nuevo || ''
    }
    this.newsletterService.postNewsletter(newsletter).subscribe({
      next: (respuesta: ApiresponsePartial) => {
        console.log(respuesta)
        this.snackbar.open('Newsletter creada.', 'Aceptar', {
          duration: 3000
        })
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
        this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  // Permite abrir modal para editar newsletter
  modalEditarNewsletter(id: string) {
    let title: string = 'Editar suscripción'; // Título del modal
    let btnClass = 'guardar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.newsletterService.getNewsletter(id).subscribe((respuesta) => {
      this.editarNewsForm.patchValue({
        email_editar: respuesta.data.email
      })
    })

    this.dialogService.openDialog(this.modalEditar, title, btnClass, btnCancel).then(confirm => {
      if(confirm && this.editarNewsForm.valid) {
        this.editarNewsletter(id)
      }
    })
  }

  // Permite editar una newsletter
  editarNewsletter(id: string) {
    let newsletter = {
      email: this.editarNewsForm.value.email_editar || ''
    }
    this.newsletterService.updateNewsletter(id, newsletter).subscribe({
      next: (respuesta: ApiresponsePartial) => {
        this.snackbar.open('Newsletter actualizada.', 'Aceptar', {
          duration: 3000
        })
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('No se ha encontrado el registro.', 'Aceptar', {
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

  // Permite abrir modal para eliminar una newsletter
  modalDeleteNewsletter(id:string) {
    let title: string = 'Eliminar suscripción'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.newsletterService.getNewsletter(id).subscribe((respuesta) => {
      this.newsletter = respuesta.data
    })

    this.dialogService.openDialog(this.modalEliminar, title, btnClass, btnCancel).then(confirm => {
      if(confirm) {
        this.eliminarNewsletter(id)
      }
    })
  }

  // Permite eliminar una newsletter
  eliminarNewsletter(id: string) {
    this.newsletterService.deleteNewsletter(id).subscribe({
      next: (respuesta: ApiresponsePartial) => {
        this.snackbar.open('Newsletter eliminada.', 'Aceptar', {
          duration: 3000
        })
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('No se ha encontrado el registro.', 'Aceptar', {
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

  modalEliminarSeleccionNewsletters() {
    let title: string = 'Eliminar suscripciones'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.dialogService.openDialog(this.modalEliminarSeleccion, title, btnClass, btnCancel).then(confirm => {
      if(confirm) {
        this.eliminarSeleccionNewsletters()
      }
    })
  }

  eliminarSeleccionNewsletters() {
    this.newsletterService.deleteSelectedNewsletter(this.selectedIds).subscribe({
      next: (respuesta: ApiresponsePartial) => {
        this.snackbar.open('Suscripciones eliminadas.', 'Aceptar', {
          duration: 3000
        })
        this.datatableService._observable$.next() // Emitimos observable para reiniciar las ids
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('No se han encontrado los registros.', 'Aceptar', {
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

  // Método que se ejecuta cuando cambia la selección en el hijo para los checkbox
  onSelectionChange(ids: string[]) {
    this.selectedIds = ids;
  }
}
