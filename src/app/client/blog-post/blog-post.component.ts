import { Component, inject, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Meta, Title } from '@angular/platform-browser';
import { PostService } from '../../services/api/post.service';
import { PostPartial } from '../../interfaces/post';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import localeEs from '@angular/common/locales/es';
import { MatCardModule } from '@angular/material/card';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-blog-post',
  standalone: true,
  providers: [{provide: LOCALE_ID, useValue: 'es'}],
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterLink, MatCardModule],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss'
})
export class BlogPostComponent implements OnInit, OnDestroy{

  slug: string = ''
  post: PostPartial = {}
  lastposts: PostPartial[] = []
  filesEndPoint: string = environment.FilesEndpoint
  suscripcion: Subscription = new Subscription()
  private title = inject(Title)
  private meta = inject(Meta)
  private activatedRoute = inject(ActivatedRoute)
  private router = inject(Router)
  private postService = inject(PostService)
  private snackbar = inject(MatSnackBar)

  ngOnInit(): void {
    this.getLastPosts()

    this.suscripcion = this.activatedRoute.paramMap.subscribe((respuesta) => {
      this.slug = this.activatedRoute.snapshot.params['slug'] // ¡¡CUIDADO!! ¡¡Si esto no se pone al pinchar en otro post, no se va a actualizar!!
      this.getPost()
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe()
  }

  getPost() {
    if(this.slug) {
      this.postService.getPostBySlug(this.slug).subscribe({
        next: (respuesta) => {
          this.post = respuesta.data[0]
          this.title.setTitle(`${this.post.titulo} - Clínica veterinaria La Huella`)
          this.meta.updateTag(
            { name: 'description', content: this.post.metadescription ? this.post.metadescription : 'Entrada de blog sobre el mundo animal.' }
          )
          this.meta.updateTag(
            { name: 'keywords', content: this.post.keywords ? this.post.keywords : 'blog, novedades, noticias animales, noticias mundo animal'}
          )
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
  }

  getLastPosts () {
    this.postService.getPosts({estado: 'publicado', limit: 3}).subscribe({
      next: (respuesta) => {
        this.lastposts = respuesta.data
      }
    })
  }
}
