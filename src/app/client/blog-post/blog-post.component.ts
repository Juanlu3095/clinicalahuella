import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../partials/header/header.component';
import { FooterComponent } from '../../partials/footer/footer.component';
import { Title } from '@angular/platform-browser';
import { PostService } from '../../services/api/post.service';
import { PostOptional } from '../../interfaces/post';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss'
})
export class BlogPostComponent implements OnInit{

  slug: string = ''
  post: PostOptional = {}
  private title = inject(Title)
  private postService = inject(PostService)

  ngOnInit(): void {
    this.title.setTitle('Post - Clínica veterinaria La Huella')
  }

  getPost() {
    if(this.slug) {
      this.postService.getPosts({ slug: this.slug }).subscribe({
        next: (response) => {
          console.log(response)
        },
        error: (error) => {
          console.error(error)
        }
      })
    }
  }
}
