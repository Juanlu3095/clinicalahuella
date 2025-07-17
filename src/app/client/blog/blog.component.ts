import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PostPartial } from '../../interfaces/post';
import { PostService } from '../../services/api/post.service';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, MatCardModule, MatGridListModule, MatPaginatorModule, RouterLink, CommonModule],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit{

  posts: PostPartial[] = []

  private title = inject(Title)
  private meta = inject(Meta)
  private postService = inject(PostService)
  private snackbar = inject(MatSnackBar)

  paginatedData: PostPartial[] = []; // El array que contendrá los posts por página seleccionada, se actualiza al cambiar de página con paginateData
  pageSize = 6; // Número de elementos por página por defecto
  currentPage = 0; // Usamos esto para el slice de paginateData

  filesEndPoint: string = environment.DriveEndPoint

  ngOnInit(): void {
    this.title.setTitle('Blog - Clínica veterinaria La Huella')
    this.meta.updateTag({ name: 'description', content: 'Blog de noticias sobre el mundo animal.' })
    this.meta.updateTag({ name: 'keywords', content: 'blog, novedades, noticias animales, noticias mundo animal'})

    this.getPosts()
  }

  getPosts () {
    this.postService.getPosts({estado:'publicado'}).subscribe({
      next: (respuesta: ApiresponsePartial) => {
        this.posts = respuesta.data
        this.paginateData()
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.snackbar.open('Posts no encontrados.', 'Aceptar', {
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

  // PAGINACIÓN
  paginateData() {
    const startIndex = this.currentPage * this.pageSize; // La paginación empieza en la posicion 0
    const endIndex = startIndex + this.pageSize; // Marcaría la última posición del array posts

    // slice permite excluir del array elementos de un extremo al otro, siendo startIndex el inicio de la página y endIndex el final
    this.paginatedData = this.posts.slice(startIndex, endIndex);
  }

  // Se ejecuta cuando cambiamos el numero de elementos por página en mat-paginator
  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize; // las propiedades pageSize y pageIndex las da el tipo PageEvent
    this.currentPage = event.pageIndex;
    this.paginateData(); // Se actualizan los filtros de las páginas para generar el paginador
  }

}
