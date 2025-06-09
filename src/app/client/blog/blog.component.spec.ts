import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogComponent } from './blog.component';
import { Observable, of } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { PostService } from '../../services/api/post.service';
import { appConfig } from '../../app.config';
import { PageEvent } from '@angular/material/paginator';

const mockPostResponse = {
  "message": "Posts encontrados.",
  "data": [
    {
      "id": 87,
      "slug": "pruebapepe",
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
    },
    {
      "id": 86,
      "slug": "h",
      "titulo": "Javier",
      "contenido": "",
      "imagen": "image_1749029186922.jpeg",
      "categoriaId": null,
      "categoria": null,
      "metadescription": "",
      "keywords": "",
      "estado": "publicado",
      "created_at": "2025-06-03T09:55:44.000Z",
      "updated_at": "2025-06-04T09:26:43.000Z"
    },
  ]
}

const mockPostService: {
  getPosts: () => Observable<ApiresponsePartial>
} = {
  getPosts: () => of({})
}

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogComponent],
      providers: [
        ...appConfig.providers,
        { provide: PostService, useValue: mockPostService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get posts, getPosts()', () => {
    const spyGetPosts = spyOn(mockPostService, 'getPosts')
    spyGetPosts.and.returnValue(of(mockPostResponse))
    component.ngOnInit()
    expect(mockPostService.getPosts).toHaveBeenCalled()
  })

  it('should paginate posts, paginateData()', () => {
    const spyGetPosts = spyOn(mockPostService, 'getPosts')
    spyGetPosts.and.returnValue(of(mockPostResponse))
    const spyPaginateData = spyOn(component, 'paginateData') // Espiamos al metodo
    spyPaginateData.and.callThrough() // Cuando se vaya a llamar al método paginateData, se llama a la función real

    component.pageSize = 1
    component.getPosts()
    expect(component.paginatedData.length).toBe(1)
    expect(spyPaginateData).toHaveBeenCalled()

    component.pageSize = 2
    component.getPosts()
    expect(component.paginatedData.length).toBe(2)
    expect(spyPaginateData).toHaveBeenCalled()
  })

  it('should reorganize posts when changing page size, onPageChange()', () => {
    const spyGetPosts = spyOn(mockPostService, 'getPosts')
    spyGetPosts.and.returnValue(of(mockPostResponse))
    const spyPaginateData = spyOn(component, 'paginateData')
    component.pageSize = 1 // Tenemos dos páginas con 1 post en cada una
    component.getPosts()

    const evento = new PageEvent() // Declaramos el evento
    evento.pageIndex = 2 // Cambiamos el indice de la página actual
    component.onPageChange(evento) // Ejecutamos el método asignado al cambio de página del html
    expect(component.currentPage).toBe(2) // Comprobamos que currentPage haya cambiado al ejecutar el evento
    expect(spyPaginateData).toHaveBeenCalled() // Comprobamos que paginateData se haya ejecutado al producirse el evento
  })
});
