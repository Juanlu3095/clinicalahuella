import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogPostComponent } from './blog-post.component';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { appConfig } from '../../app.config';
import { PostService } from '../../services/api/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

const mockApiOnepostResponse = {
  "message": "Post encontrado.",
  "data": [
    {
      "id": 1,
      "slug": "5-consejos-para-cuidadores",
      "titulo": "5 consejos para cuidadores",
      "contenido": "El cuidado animal es una responsabilidad que va mucho más allá de alimentar y pasear a nuestras mascotas.",
      "categoriaId": 3,
      "categoria": "Cuidado animal",
      "imagen": "image_1748173718118.jpg",
      "metadescription": "5 consejos para saber cómo mimar a nuestras mascotas correctamente",
      "keywords": "consejos, cuidados, cuidado animal",
      "estado": "publicado",
      "created_at": "2025-04-10T09:51:42.000Z",
      "updated_at": "2025-05-27T17:31:12.000Z"
    }
  ]
}

const mockApiLastpostsResponse = {
  "message": "Posts encontrados.",
  "data": [
    {
      "id": 87,
      "slug": "prueba",
      "titulo": "Prueba",
      "contenido": "",
      "imagen": "image_1749029448518.webp",
      "categoriaId": null,
      "categoria": null,
      "metadescription": "",
      "keywords": "",
      "estado": "publicado",
      "created_at": "2025-06-04T09:30:48.000Z",
      "updated_at": "2025-06-09T11:38:46.000Z"
    }
  ]
}

const mockApiResponseNotfound = {
  "error": "Posts no encontrados."
}

const mockPostService: {
  getPosts: () => Observable<ApiresponsePartial>,
  getPostBySlug: (slug: string) => Observable<ApiresponsePartial>
} = {
  getPosts: () => of({}),
  getPostBySlug: (slug: string) => of({})
}

const mockSnackBar = jasmine.createSpyObj(['open'])

describe('BlogPostComponent', () => {
  let component: BlogPostComponent;
  let fixture: ComponentFixture<BlogPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostComponent],
      providers: [...appConfig.providers,
        { provide: PostService, useValue: mockPostService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get post by slug, getPost()', () => {
    // CORRECT
    const spyGetPost = spyOn(mockPostService, 'getPostBySlug')
    spyGetPost.and.returnValue(of(mockApiOnepostResponse))
    component.slug = "5-consejos-para-cuidadores"
    component.getPost()
    expect(mockPostService.getPostBySlug).toHaveBeenCalledWith(component.slug)
    expect(component.post).toBe(mockApiOnepostResponse.data[0])

    // INCORRECT: 404
    spyGetPost.and.returnValue(throwError(() => new HttpErrorResponse({ error: mockApiResponseNotfound, status: 404 })))
    component.post = {}
    component.getPost()
    expect(mockPostService.getPostBySlug).toHaveBeenCalledWith(component.slug)
    expect(component.post).toEqual({})
    expect(mockSnackBar.open).toHaveBeenCalledWith('Post no encontrado.', 'Aceptar', { duration: 3000 })
  })

  it('should get last 3 posts, getLastPosts()', () => {
    // CORRECT
    const spyGetLastPosts = spyOn(mockPostService, 'getPosts')
    spyGetLastPosts.and.returnValue(of(mockApiLastpostsResponse))
    component.getLastPosts()
    expect(mockPostService.getPosts).toHaveBeenCalled()

    // INCORRECT: 404
    spyGetLastPosts.and.returnValue(throwError(() => 'Posts no encontrados.'))
    component.lastposts = []
    component.getLastPosts()
    expect(mockPostService.getPosts).toHaveBeenCalled()
    expect(component.lastposts).toEqual([])
  })
});
