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

  filesEndPoint: string = environment.FilesEndpoint

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

}
