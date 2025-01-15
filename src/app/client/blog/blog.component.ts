import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, MatCardModule, MatGridListModule, MatPaginatorModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent implements OnInit{

  private title = inject(Title)
  private meta = inject(Meta)

  ngOnInit(): void {
    this.title.setTitle('Blog - Clínica veterinaria La Huella')
    this.meta.updateTag({ name: 'description', content: 'Blog de noticias sobre el mundo animal.' })
    this.meta.updateTag({ name: 'keywords', content: 'blog, novedades, noticias animales, noticias mundo animal'})
  }
}
