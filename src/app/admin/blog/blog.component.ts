import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { PostService } from '../../services/api/post.service';
import { Post, PostPartial } from '../../interfaces/post';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { MatButtonModule } from '@angular/material/button';
import { TableButton } from '../../interfaces/tablebutton';
import { Subscription } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogService } from '../../services/material/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatatableService } from '../../services/material/datatable.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [DatatableComponent, MatButtonModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit{

  posts: PostPartial[] = []
  post: PostPartial = {} as PostPartial
  columns: string[] = ['titulo', 'slug']
  displayedColumns = ['select',...this.columns, 'acciones'];
  selectedIds: number[] = [];
  suscripcion: Subscription = new Subscription();
  private router = inject(Router)
  title = inject(Title)

  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminarSeleccion') modalEliminarSeleccion!: TemplateRef<HTMLElement>;

  public botones: TableButton[] = [
    {id: 1, nombre: 'Ver', class: 'ver', accion: (id:number) => this.verPost(id) }, // nos lleva a la página del post en el cliente
    {id: 2, nombre: 'Editar', class: 'editar', accion: (id:number) => this.editarPost(id) },
    {id: 3, nombre: 'Eliminar', class: 'danger', accion: (id: number) => this.modalEliminarPost(id)},
  ]

  public constructor(
    private postService: PostService,
    private dialogService: DialogService,
    private datatableService: DatatableService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Blog < Clínica veterinaria La Huella')
    this.getPosts()

    this.suscripcion = this.postService.refresh$.subscribe(() => {
      this.getPosts()
    })
  }

  getPosts() {
    this.postService.getPosts({}).subscribe({
      next: (respuesta) => {
        this.posts = respuesta.data
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  getPost(id: number) {
    this.postService.getPostById(id).subscribe({
      next: (respuesta) => {
        if (Array.isArray(respuesta.data)) {
          this.post = respuesta.data[0]
        } else {
          this.post = respuesta.data
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.snackbar.open('Post no encontrado.', 'Aceptar', {
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

  verPost(id: number) {
    this.postService.getPostById(id).subscribe({
      next: (respuesta: ApiresponsePartial) => {
        if(respuesta.data[0].estado === 'publicado') {
          this.router.navigate(['/blog', respuesta.data[0].slug])
        } else {
          this.snackbar.open('Post no publicado.', 'Aceptar', {
            duration: 3000
          })
        }
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  editarPost(id: number) {
    this.router.navigate([`admin/blog/${id}/editar`])
  }

  modalEliminarPost(id: number) {
    let title: string = 'Eliminar post'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de eliminar
    let btnCancel = 'cancelar';

    this.getPost(id)
    this.dialogService.openDialog({html: this.modalEliminar, title, btnClass, btnCancel}).then(confirm => {
      if (confirm) {
        this.eliminarPost(id)
      }
    })
  }

  eliminarPost(id: number) {
    this.postService.deletePost(id).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Post eliminado.', 'Aceptar', {
            duration: 3000
          })
      },
      error: (error: HttpErrorResponse) => {
        if(error.status === 404) {
          this.snackbar.open('Post no encontrado.', 'Aceptar', {
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

  modalEliminarSeleccionPosts() {
    let title: string = 'Eliminar posts'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.dialogService.openDialog({html: this.modalEliminarSeleccion, title, btnClass, btnCancel}).then(confirm => {
      if(confirm) {
        this.eliminarPosts()
      }
    })
  }

  eliminarPosts = () => {
    this.postService.deletePosts(this.selectedIds).subscribe({
      next: (respuesta) => {
        this.datatableService._observable$.next() // Emitimos observable para reiniciar las ids
        this.snackbar.open('Posts eliminados.', 'Aceptar', {
          duration: 3000
        })
      },
      error: (error) => {
        this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  // Método que se ejecuta cuando cambia la selección en el hijo para los checkbox
  onSelectionChange(ids: number[]) {
    this.selectedIds = ids;
  }
}
