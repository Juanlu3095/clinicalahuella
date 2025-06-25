import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostNuevoComponent } from './post-nuevo.component';
import { CategoryService } from '../../services/api/category.service';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { appConfig } from '../../app.config';
import { PostService } from '../../services/api/post.service';
import { DialogService } from '../../services/material/dialog.service';
import { By } from '@angular/platform-browser';
import { ResponsivedesignService } from '../../services/responsivedesign.service';

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

const mockPostServiceResponse = {
  "message": "Post creado.",
  "data": 1
}

const mockPostService: {
  postPost: () => Observable<ApiresponsePartial>
} = {
  postPost: () => of(mockPostServiceResponse)
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

describe('PostNuevoComponent', () => {
  let component: PostNuevoComponent;
  let fixture: ComponentFixture<PostNuevoComponent>;
  let categoriasService: CategoryService
  let postService: PostService
  let dialogService: DialogService
  let responsiveService: ResponsivedesignService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostNuevoComponent],
      providers: [
        ...appConfig.providers,
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

    fixture = TestBed.createComponent(PostNuevoComponent);
    component = fixture.componentInstance;
    categoriasService = TestBed.inject(CategoryService)
    postService = TestBed.inject(PostService)
    dialogService = TestBed.inject(DialogService)
    responsiveService = TestBed.inject(ResponsivedesignService)

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy() // Se elimina el componente tras cada test, eliminando suscripciones y otras operaciones pendientes
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title.getTitle()).toBe('Nueva entrada < Clínica veterinaria La Huella')
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

  it('should create create post, getCategories()', () => {
    const postServiceSpy = spyOn(postService, 'postPost')
    postServiceSpy.and.returnValue(of(mockPostServiceResponse))

    component.postForm.patchValue({
      titulo: 'Título de prueba',
      slug: 'Slug de prueba'
    })

    component.crearPost()

    expect(postService.postPost).toHaveBeenCalled()
  })

  it('should not create create post because postForm not valid', () => {
    const postServiceSpy = spyOn(postService, 'postPost')
    postServiceSpy.and.returnValue(of(mockPostServiceResponse))

    component.postForm.patchValue({
      titulo: 'Título de prueba',
    })

    component.crearPost()

    expect(postService.postPost).not.toHaveBeenCalled() // No se llama al servicio porque el formulario no es válido.
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
