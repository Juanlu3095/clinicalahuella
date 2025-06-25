import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditarComponent } from './post-editar.component';
import { CategoryService } from '../../services/api/category.service';
import { PostService } from '../../services/api/post.service';
import { DialogService } from '../../services/material/dialog.service';
import { ResponsivedesignService } from '../../services/responsivedesign.service';
import { appConfig } from '../../app.config';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { By } from '@angular/platform-browser';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

const mockCategoriasServiceResponse = {
  "message": "Categorías encontradas.",
  "data": [
    {
      "id": 1,
      "nombre": "Perros",
      "created_at": "2025-04-20T17:27:57.000Z",
      "updated_at": "2025-04-20T17:27:57.000Z"
    }
  ]
}

const mockCategoriasService: {
  getCategories: () => Observable<ApiresponsePartial>
} = {
  getCategories: () => of(mockCategoriasServiceResponse)
}

const mockGetPostServiceResponse = {
  "message": "Post encontrado.",
  "data": [
    {
      "id": 1,
      "slug": "5-consejos-para-cuidadores",
      "titulo": "5 consejos para cuidadores",
      "contenido": "El cuidado animal es una responsabilidad que va mucho más allá de alimentar y pasear a nuestras mascotas.",
      "imagenId": 55,
      "imagen": "image_1748173718118.jpg",
      "categoriaId": 3,
      "categoria": "Cuidado animal",
      "metadescription": "5 consejos para saber cómo mimar a nuestras mascotas correctamente",
      "keywords": "consejos, cuidados, cuidado animal",
      "estado": "publicado",
      "created_at": "2025-04-10T09:51:42.000Z",
      "updated_at": "2025-05-27T17:31:12.000Z"
    }
  ]
}

const mockPostServiceResponse = {
  "message": "Post actualizado."
}

const mockPostService: {
  getPostById: () => Observable<ApiresponsePartial>,
  updatePost: () => Observable<ApiresponsePartial>
} = {
  getPostById: () => of(mockGetPostServiceResponse),
  updatePost: () => of(mockPostServiceResponse)
}

const mockDialogResponse = Promise.resolve('confirm')

const mockDialogService: {
  openDialog: () => Promise<any>
} = {
  openDialog: () => Promise.resolve('confirm')
}

const mockResponsiveService: {
  obtenerDispositivo: () =>  Observable<"Móvil" | "Tablet" | "Portátil" | "Escritorio" | "Dispositivo desconocido">
} = {
  obtenerDispositivo: () => of("Escritorio")
}

describe('PostEditarComponent', () => {
  let component: PostEditarComponent;
  let fixture: ComponentFixture<PostEditarComponent>;
  let categoriasService: CategoryService
  let postService: PostService
  let dialogService: DialogService
  let responsiveService: ResponsivedesignService
  let loader: HarnessLoader

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditarComponent],
      providers: [...appConfig.providers,
        CategoryService,
        { provider: CategoryService, useValue: mockCategoriasService },
        PostService,
        { provider: PostService, useValue: mockPostService },
        DialogService,
        { provider: DialogService, useValue: mockDialogService },
        ResponsivedesignService,
        { provider: ResponsivedesignService, useValue: mockResponsiveService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditarComponent);
    component = fixture.componentInstance;
    categoriasService = TestBed.inject(CategoryService)
    postService = TestBed.inject(PostService)
    dialogService = TestBed.inject(DialogService)
    responsiveService = TestBed.inject(ResponsivedesignService)
    loader = TestbedHarnessEnvironment.loader(fixture)

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    const id = 1
    const postServiceSpy = spyOn(postService, 'getPostById')
    postServiceSpy.and.returnValue(of(mockGetPostServiceResponse))
    component.getPost(id)
    expect(component.title.getTitle()).toBe(`Editar: ${mockGetPostServiceResponse.data[0].titulo} < Clínica veterinaria La Huella`)
  })

  it('should get all post categories', () => {
    const categoriasServiceSpy = spyOn(categoriasService, 'getCategories')
    categoriasServiceSpy.and.returnValue(of(mockCategoriasServiceResponse))
  
    component.ngOnInit()
  
    expect(categoriasService.getCategories).toHaveBeenCalled()
    expect(component.categorias).toEqual(mockCategoriasServiceResponse.data)
  
    // SAD PATH: Error del servidor
    categoriasServiceSpy.and.returnValue(throwError(() => 'Categorías no encontradas.'))
    component.categorias = [] // Hacemos que vuelva a estar vacío, como al principio
    component.getCategories() // Volvemos a llamar al método para obtener la categorías
    expect(categoriasService.getCategories).toHaveBeenCalled()
    expect(component.categorias).toEqual([])
  })

  it('should get post, getPost()', () => {
    const getPostServiceSpy = spyOn(postService, 'getPostById')
    getPostServiceSpy.and.returnValue(of(mockGetPostServiceResponse))

    fixture.detectChanges()
    component.getPost(1)

    expect(postService.getPostById).toHaveBeenCalled()
    expect(postService.getPostById).toHaveBeenCalledWith(1)
    expect(component.post).toEqual(mockGetPostServiceResponse.data[0])

    // SAD PATH
    getPostServiceSpy.and.returnValue(throwError(() => 'Post no encontrado.'))
    component.post = {}
    component.getPost(1)
    expect(postService.getPostById).toHaveBeenCalled()
    expect(component.post).toEqual({})
  })

  it('should show input to send image, nuevaImagen()', async () => {
    const getPostServiceSpy = spyOn(postService, 'getPostById')
    getPostServiceSpy.and.returnValue(of(mockGetPostServiceResponse))
    
    component.ngOnInit()
    component.getPost(1)
    const btnImageInput = await loader.getAllHarnesses(MatButtonHarness.with({ selector: '.btn-nuevaimg' }))
    expect(component.imagenActual.nativeElement.classList.contains('oculto')).toBeFalse() // El input de la imagen no tiene la clase 'oculto'
    expect(component.imagenNueva.nativeElement.classList.contains('oculto')).toBeTrue()
    
    await btnImageInput[0].click()

    expect(component.imagenActual.nativeElement.classList.contains('oculto')).toBeTrue()
    expect(component.imagenNueva.nativeElement.classList.contains('oculto')).toBeFalse()
  })

  it('should update post, editarPost()', () => {
    const postServiceSpy = spyOn(postService, 'updatePost')
    postServiceSpy.and.returnValue(of(mockPostServiceResponse))

    const postUpdate = { // El formulario tiene valores por defecto
      titulo: 'Título de prueba',
      slug: 'Slug de prueba',
      contenido: '', 
      categoriaId: null, 
      estado: 'borrador', 
      keywords: '', 
      metadescription: ''
    }
    
    component.postEditarForm.patchValue({
      titulo: 'Título de prueba',
      slug: 'Slug de prueba',
    })
    component.idPost = 1

    component.editarPost()
    
    expect(postService.updatePost).toHaveBeenCalled()

    // SAD PATH
    postServiceSpy.and.returnValue(throwError(() => 'Post no encontrado.'))
    component.editarPost()
    expect(postService.updatePost).toHaveBeenCalled()
    expect(postService.updatePost).toHaveBeenCalledWith(1, postUpdate)
    // expect(component.editarPost).toThrowError('Post no encontrado.') // HACE FALTA COMPROBAR EL ERROR
  })

  it('should send image, enviarImagen()', () => {
    spyOn(component, 'enviarImagen').and.callThrough();
    fixture.detectChanges();

    const fileInput = fixture.debugElement.query(By.css('.fileInput')).nativeElement
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const dt = new DataTransfer()
    dt.items.add(mockFile)

    fileInput.files = dt.files
    const changeEvent = new Event('change');
    fileInput.dispatchEvent(changeEvent)
    fixture.detectChanges();
    expect(component.enviarImagen).toHaveBeenCalledWith(changeEvent)
    expect(component.postEditarForm.value.imagen).not.toEqual(null) // imagen del form sigue siendo null, quizá porque la imagen es falsa?
  })

  it('should open aichat', () => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(mockDialogResponse)
  
    const btnAbrirChat = fixture.debugElement.query(By.css('.btn-ai'))
    btnAbrirChat.triggerEventHandler('click')
  
    expect(dialogService.openDialog).toHaveBeenCalled()
  })

  it('should have responsive design', () => {
    const responsiveServiceSpy = spyOn(responsiveService, 'obtenerDispositivo')
    responsiveServiceSpy.and.returnValue(of("Escritorio"))

    component.ngOnInit()

    expect(responsiveService.obtenerDispositivo).toHaveBeenCalled()
  })
});
