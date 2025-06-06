import { TestBed } from '@angular/core/testing';

import { PostService } from './post.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { Post } from '../../interfaces/post';

describe('PostService', () => {
  let service: PostService;
  let httpTestingController: HttpTestingController; // Para crear datos simulados
  const baseUrl = 'http://localhost:3000/posts' // Url que simulamos

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PostService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all posts', () => {
    const dummyResponse = {
      message: 'Posts encontrados.',
      data: [
        {
          "categoria": "Cuidado animal",
          "categoriaId": 3,
          "contenido": "El cuidado animal es una responsabilidad",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "publicado",
          "id": 1,
          "imagen": "imagen.jpg",
          "keywords": "consejos, cuidados",
          "metadescription": "5 consejos para el cuidado de nuestras mascotas",
          "slug": "5-consejos-para-cuidadores",
          "titulo": "5 consejos para cuidadores",
          "updated_at": "2025-05-27T17:31:12.000Z"
        },
        {
          "categoria": "Prueba",
          "categoriaId": 3,
          "contenido": "Contenido de prueba",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "borrador",
          "id": 2,
          "imagen": "imagen.jpg",
          "keywords": "pruebas",
          "metadescription": "Metadescripcion de prueba",
          "slug": "prueba",
          "titulo": "Titulo de prueba",
          "updated_at": "2025-05-27T17:31:12.000Z"
        },
      ]
    }

    service.getPosts({}).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(2) // Comprobamos que data contenga 2 elementos
      const firstPost: Post = respuesta.data.find((post: Post) => post.id === 1)
      expect(firstPost.titulo).toBe("5 consejos para cuidadores")
      expect(respuesta).toBe(dummyResponse)
    })
    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    
    // flush debe ir siempre después de la suscripción al método del servicio, ya que éste espera resolver la petición, la cual no lo
    // hace porque es simulada con provideHttpClientTesting y HttpTestingController. Sin el flush, la petición se queda esperando
    // para siempre.
    mockRequest.flush(dummyResponse)
  })

  it('should get all posts with estado publicado', () => {
    const dummyResponse = {
      message: 'Posts encontrados.',
      data: [
        {
          "categoria": "Cuidado animal",
          "categoriaId": 3,
          "contenido": "El cuidado animal es una responsabilidad",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "publicado",
          "id": 1,
          "imagen": "imagen.jpg",
          "keywords": "consejos, cuidados",
          "metadescription": "5 consejos para el cuidado de nuestras mascotas",
          "slug": "5-consejos-para-cuidadores",
          "titulo": "5 consejos para cuidadores",
          "updated_at": "2025-05-27T17:31:12.000Z"
        }
      ]
    }

    service.getPosts({estado: 'publicado'}).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1) // Comprobamos que data contenga 2 elementos
      const post: Post = respuesta.data.find((post: Post) => post.id === 1)
      expect(post.titulo).toBe("5 consejos para cuidadores")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}?estado=publicado`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.params.get('estado')).toBe('publicado') // Comprobamos que el param sea el correcto

    mockRequest.flush(dummyResponse)
  })

  it('should get all posts with categoria cuidado animal', () => {
    const dummyResponse = {
      message: 'Posts encontrados.',
      data: [
        {
          "categoria": "Cuidado animal",
          "categoriaId": 3,
          "contenido": "El cuidado animal es una responsabilidad",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "publicado",
          "id": 1,
          "imagen": "imagen.jpg",
          "keywords": "consejos, cuidados",
          "metadescription": "5 consejos para el cuidado de nuestras mascotas",
          "slug": "5-consejos-para-cuidadores",
          "titulo": "5 consejos para cuidadores",
          "updated_at": "2025-05-27T17:31:12.000Z"
        }
      ]
    }

    service.getPosts({categoria: 'Cuidado animal'}).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1) // Comprobamos que data contenga 2 elementos
      const post: Post = respuesta.data.find((post: Post) => post.id === 1)
      expect(post.titulo).toBe("5 consejos para cuidadores")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}?categoria=Cuidado%20animal`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.params.get('categoria')).toBe('Cuidado animal') // Comprobamos que el param sea el correcto

    mockRequest.flush(dummyResponse)
  })

  it('should get all posts with estado publicado and limit 1', () => {
    const dummyResponse = {
      message: 'Posts encontrados.',
      data: [
        {
          "categoria": "Cuidado animal",
          "categoriaId": 3,
          "contenido": "El cuidado animal es una responsabilidad",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "publicado",
          "id": 1,
          "imagen": "imagen.jpg",
          "keywords": "consejos, cuidados",
          "metadescription": "5 consejos para el cuidado de nuestras mascotas",
          "slug": "5-consejos-para-cuidadores",
          "titulo": "5 consejos para cuidadores",
          "updated_at": "2025-05-27T17:31:12.000Z"
        }
      ]
    }

    service.getPosts({estado: 'publicado', limit: 1}).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1) 
      expect(respuesta.data[0].titulo).toBe("5 consejos para cuidadores")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}?estado=publicado&limit=1`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    expect(mockRequest.request.params.get('estado')).toBe('publicado') // Comprobamos que el param sea el correcto
    expect(mockRequest.request.params.get('limit')).toBe('1') // Recuerda que los params son siempre STRINGS, llegan a la api como string

    mockRequest.flush(dummyResponse)
  })

  it('should get a post by id', () => {
    const dummyResponse = {
      message: 'Posts encontrado.',
      data: [
        {
          "categoria": "Cuidado animal",
          "categoriaId": 3,
          "contenido": "El cuidado animal es una responsabilidad",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "publicado",
          "id": 1,
          "imagen": "imagen.jpg",
          "keywords": "consejos, cuidados",
          "metadescription": "5 consejos para el cuidado de nuestras mascotas",
          "slug": "5-consejos-para-cuidadores",
          "titulo": "5 consejos para cuidadores",
          "updated_at": "2025-05-27T17:31:12.000Z"
        }
      ]
    }

    service.getPostById(1).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1)
      expect(respuesta.data[0].titulo).toBe("5 consejos para cuidadores")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/1`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')

    mockRequest.flush(dummyResponse)
  })

  it('should not get a post by id because post was not found', () => {
    const dummyResponse = {
      "error": "Post no encontrado."
    }
  
    const wrongIdPost = 1
  
    service.getPostById(wrongIdPost).subscribe({
      next: () => fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Post no encontrado.")
        expect(error.status).toBe(404)
      }
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${wrongIdPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
    // flush => incluso errores con código 400 ó 500
    // error => errores de red, cors
  })

  it('should get a post by slug', () => {
    const dummyResponse = {
      message: 'Posts encontrado.',
      data: [
        {
          "categoria": "Cuidado animal",
          "categoriaId": 3,
          "contenido": "El cuidado animal es una responsabilidad",
          "created_at": "2025-04-10T09:51:42.000Z",
          "estado": "publicado",
          "id": 1,
          "imagen": "imagen.jpg",
          "keywords": "consejos, cuidados",
          "metadescription": "5 consejos para el cuidado de nuestras mascotas",
          "slug": "5-consejos-para-cuidadores",
          "titulo": "5 consejos para cuidadores",
          "updated_at": "2025-05-27T17:31:12.000Z"
        }
      ]
    }
    const slug = '5-consejos-para-cuidadores'
    service.getPostBySlug(slug).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.data).toHaveSize(1) 
      expect(respuesta.data[0].titulo).toBe("5 consejos para cuidadores")
    })
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/slug/${slug}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')

    mockRequest.flush(dummyResponse)
  })

  it('should not get a post by slug because post was not found', () => {
    const dummyResponse = {
      "error": "Post no encontrado."
    }
  
    const wrongSlugPost = '10-consejos-para-cuidadores'
  
    service.getPostBySlug(wrongSlugPost).subscribe({
      next: () => fail,
      error: (error: HttpErrorResponse) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Post no encontrado.")
        expect(error.status).toBe(404)
      }
    })
  
    const mockRequest = httpTestingController.expectOne(`${baseUrl}/slug/${wrongSlugPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('GET')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
    // flush => incluso errores con código 400 ó 500
    // error => errores de red, cors
  })

  it('should create a post', () => {
    const dummyResponse = {
      "message": "Post creado."
    }

    const postForm = {
      "titulo": "Titulo de prueba",
      "slug": "prueba"
    }

    service.postPost(postForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Post creado.")
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse)
  })

  it('should not create a post because validation fails', () => {
    const dummyResponse = {
      "error": "El campo slug es requerido."
    }

    const postForm = {
      "titulo": "Titulo de prueba"
    }

    service.postPost(postForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("El campo slug es requerido.")
        expect(error.status).toBe(422)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse, { status: 422, statusText: 'Unprocessable object.' })
  })

  it('should not create a post', () => {
    const dummyResponse = {
      "error": "Post no creado."
    }

    const postForm = {
      "titulo": "Titulo de prueba",
      "slug": "prueba"
    }

    service.postPost(postForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Post no creado.")
        expect(error.status).toBe(500)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')
    mockRequest.flush(dummyResponse, { status: 500, statusText: 'Internal server error.' })
  })

  it('should update a post', () => {
    const dummyResponse = {
      "message": "Post actualizado."
    }

    const updateForm = {
      "titulo": "Titulo de prueba",
      "slug": "prueba"
    }

    const idPost = 1
    service.updatePost(idPost, updateForm).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.message).toBe("Post actualizado.")
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse)
  })

  it('should not update a post because not found', () => {
    const dummyResponse = {
      "error": "Post no encontrado."
    }

    const updateForm = {
      "titulo": "Titulo de prueba"
    }

    const idPost = 3

    service.updatePost(idPost, updateForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Post no encontrado.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })

  it('should not update a post because validation fails', () => {
    const dummyResponse = {
      "error": "El campo slug es requerido."
    }

    const postForm = {
      "titulo": "Titulo de prueba"
    }

    const idPost = 1

    service.updatePost(idPost, postForm).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("El campo slug es requerido.")
        expect(error.status).toBe(422)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('PATCH')
    mockRequest.flush(dummyResponse, { status: 422, statusText: 'Unprocessable object.' })
  })

  it('should delete a post', () => {
    const dummyResponse = {
      message: 'Post eliminado.'
    }

    const idPost = 1

    service.deletePost(idPost).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy()
      expect(respuesta.message).toBe('Post eliminado.')
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse)
  })

  it('should not delete a post because not found', () => {
    const dummyResponse = {
      "error": "Post no encontrado."
    }

    const idPost = 3

    service.deletePost(idPost).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy() // Comprobamos que los datos llegan
        expect(error.error.error).toBe("Post no encontrado.")
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(`${baseUrl}/${idPost}`) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })

  it('should delete a selection of posts', () => {
    const ids = [1,2]
    const dummyResponse = {
      "message": "Posts eliminados."
    }
    
    service.deletePosts(ids).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toBeTruthy()
      expect(respuesta.message).toBe("Posts eliminados.")
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición, las ids van en el body
    expect(mockRequest.request.method).toEqual('DELETE')
    expect(mockRequest.request.body['ids']).toBe(ids)
    mockRequest.flush(dummyResponse) 
  })

  it('should not delete a selection of posts because not found', () => {
    const ids = [3,4]
    const dummyResponse = {
      "error": "Posts no encontrados."
    }
    
    service.deletePosts(ids).subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error).toBeTruthy()
        expect(error.error.error).toBe('Posts no encontrados.')
        expect(error.status).toBe(404)
      }
    })

    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('DELETE')
    expect(mockRequest.request.body['ids']).toBe(ids)
    mockRequest.flush(dummyResponse, { status: 404, statusText: 'Not found.' })
  })
});
