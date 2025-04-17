import { Component, OnInit } from '@angular/core';
import { PostService } from '../../services/api/post.service';
import { Post } from '../../interfaces/post';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { MatButtonModule } from '@angular/material/button';
import { TableButton } from '../../interfaces/tablebutton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [DatatableComponent, MatButtonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit{

  public posts: Post[] = []
  columns: string[] = ['titulo', 'slug']
  displayedColumns = ['select',...this.columns, 'acciones'];
  selectedIds: number[] = [];
  suscripcion: Subscription = new Subscription();

  public botones: TableButton[] = [
    {id: 1, nombre: 'Ver', class: 'ver', accion: (id:number) => this.verMensaje(id) }, // () => para poder usar this..., le pasamos la id del mensaje
    {id: 2, nombre: 'Editar', class: 'editar', accion: (id:number) => this.verMensaje(id) },
    {id: 3, nombre: 'Eliminar', class: 'danger', accion: (id: number) => this.verMensaje(id)},
  ]

  public constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.getPosts()

    this.suscripcion = this.postService.refresh$.subscribe(() => {
      this.getPosts()
    })
  }

  getPosts() {
    this.postService.getPosts({slug: '', categoria: ''}).subscribe({
      next: (respuesta) => {
          this.posts = respuesta.data
          console.log(this.posts)
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  // Método que se ejecuta cuando cambia la selección en el hijo para los checkbox
  onSelectionChange(ids: number[]) {
    this.selectedIds = ids;
  }

  verMensaje(id: number) {
    console.log(id)
  }
}
