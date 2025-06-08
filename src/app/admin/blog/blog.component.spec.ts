import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogComponent } from './blog.component';
import { Observable, of, Subject } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { PostService } from '../../services/api/post.service';
import { appConfig } from '../../app.config';
import { DialogService } from '../../services/material/dialog.service';
import { By } from '@angular/platform-browser';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

// Mock de la respuesta que no devuelve datos
const mockApiResponse = {
  "message": "Respuesta correcta"
}

// Mock de la respuesta que devuelve datos
const mockApiResponseWithData = {
  "message": "Posts encontrados.",
  "data": [
    {
      "categoria": null,
      "contenido": "Éste es el contenido",
      "created_at": "2025-06-04T09:30:48.000Z",
      "estado": "publicado",
      "id": 87,
      "imagen": "image_1749029448518.webp",
      "keywords": "clinica, mascotas",
      "metadescription": "Ésta es la metadescipcion",
      "slug": "Slug de prueba",
      "titulo": "Titulo de prueba",
      "updated_at": "2025-06-04T09:30:48.000Z"
    },
    {
      "categoria": null,
      "contenido": "",
      "created_at": "2025-06-04T09:30:48.000Z",
      "estado": "borrador",
      "id": 88,
      "imagen": null,
      "keywords": "",
      "metadescription": "",
      "slug": "Slug de prueba",
      "titulo": "Titulo de prueba",
      "updated_at": "2025-06-04T09:30:48.000Z"
    }
  ]
}

const mockApiResponseWithOneData = {
  "message": "Post encontrado.",
  "data": [
    {
      "categoria": null,
      "contenido": "Éste es el contenido",
      "created_at": "2025-06-04T09:30:48.000Z",
      "estado": "publicado",
      "id": 87,
      "imagen": "image_1749029448518.webp",
      "keywords": "clinica, mascotas",
      "metadescription": "Ésta es la metadescipcion",
      "slug": "Slug de prueba",
      "titulo": "Titulo de prueba",
      "updated_at": "2025-06-04T09:30:48.000Z"
    }
  ]
}

const mockDialogResponse = Promise.resolve('confirm')

const mockDialogService: {
  openDialog: () => Promise<any>
} = {
  openDialog: () => Promise.resolve('confirm')
}

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;
  let postService: PostService;
  let dialogService: DialogService;
  let loader: HarnessLoader;

  beforeEach(async () => {
    // Mock del servicio con sus propiedades y métodos
    const mockPostService: {
      refresh$: Subject<void>,
      getPosts: () => Observable<ApiresponsePartial>,
      getPostById: () => Observable<ApiresponsePartial>,
      getPostBySlug: () => Observable<ApiresponsePartial>,
      postPost: () => Observable<ApiresponsePartial>,
      updatePost: () => Observable<ApiresponsePartial>,
      deletePost: () => Observable<ApiresponsePartial>,
      deletePosts: () => Observable<ApiresponsePartial>,
    } = {
      refresh$: new Subject<void>(),
      getPosts: () => of(mockApiResponseWithData), // Hacemos que cada método del servicio nos devuelva un observable simulado
      getPostById: () => of(mockApiResponseWithOneData),
      getPostBySlug: () => of(mockApiResponseWithOneData),
      postPost: () => of(mockApiResponse),
      updatePost: () => of(mockApiResponse),
      deletePost: () => of(mockApiResponse),
      deletePosts: () => of(mockApiResponse),
    }

    await TestBed.configureTestingModule({
      imports: [BlogComponent],
      providers: [
        ...appConfig.providers,
        PostService,
        {provide: PostService, useValue: mockPostService}, // En lugar del servicio, le inyecta el mock
        DialogService,
        {provide: DialogService, useValue: mockDialogService}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    postService = TestBed.inject(PostService)
    dialogService = TestBed.inject(DialogService)
    //fixture.detectChanges(); // Esta llamada a getPosts usando ngOnInit no la detecta el spy porque aún no se ha declarado. Si se deja se ejecuta el observble -> 3 veces
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => {
    fixture.destroy() // Se elimina el componente tras cada test, eliminando suscripciones y otras operaciones pendientes
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all posts', () => {
    const postServiceSpy = spyOn(postService, 'getPosts')
    postServiceSpy.and.returnValue(of(mockApiResponseWithData))
    component.ngOnInit() // Ejecutamos el onInit (IMPORTANTE!! EL ONINIT NO SE LLAMA SOLO!!!)
    expect(postService.getPosts).toHaveBeenCalled()
  })

  it('should get post by id', () => {
    const postServiceSpy = spyOn(postService, 'getPostById')
    postServiceSpy.and.returnValue(of(mockApiResponseWithOneData))
    component.ngOnInit() // Ejecutamos el onInit (IMPORTANTE!! EL ONINIT NO SE LLAMA SOLO!!!)
    component.getPost(87)
    expect(postService.getPostById).toHaveBeenCalled()
  })

  it('should redirect to post when asking to see it', async () => {
    const verPostSpy = spyOn(component, 'verPost')
    component.ngOnInit()
    const btnVerPost = await loader.getHarness(MatButtonHarness.with({ selector: '.ver87' })) // Botón para ver el post en la tabla

    expect(btnVerPost).toBeTruthy()
    await btnVerPost.click()

    expect(component.verPost).toHaveBeenCalled()
    expect(component.verPost).toHaveBeenCalledWith(87)
  })

  it('should redirect to edit post when asking to edit post', async () => {
    const editarPostSpy = spyOn(component, 'editarPost')
    component.ngOnInit()
    const btnEditarPost = await loader.getHarness(MatButtonHarness.with({ selector: '.editar87' })) // Botón para ver el post en la tabla

    expect(btnEditarPost).toBeTruthy()
    await btnEditarPost.click()

    expect(component.editarPost).toHaveBeenCalled()
    expect(component.editarPost).toHaveBeenCalledWith(87)
  })

  it('should open modal to delete post and delete it', (done:DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const getPostsServiceSpy = spyOn(postService, 'getPosts')
    const getPostServiceSpy = spyOn(postService, 'getPostById')
    const deletePostServiceSpy = spyOn(postService, 'deletePost')

    dialogServiceSpy.and.returnValue(mockDialogResponse)
    getPostsServiceSpy.and.returnValue(of(mockApiResponseWithData))
    getPostServiceSpy.and.returnValue(of(mockApiResponseWithOneData))
    deletePostServiceSpy.and.returnValue(of(mockApiResponse))

    component.ngOnInit() // Llamamos al ngOnInit, getPosts llamado 1 vez

    component.modalEliminarPost(87)
    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(postService.getPostById).toHaveBeenCalled()
    expect(postService.getPostById).toHaveBeenCalledOnceWith(87)

    component.eliminarPost(87)
    expect(postService.deletePost).toHaveBeenCalled()
    expect(postService.deletePost).toHaveBeenCalledOnceWith(87)

    postService.refresh$.next() // getPosts llamado 2 veces
    expect(postService.getPosts).toHaveBeenCalledTimes(2)
    done()
  })

  it('should open modal to delete posts and delete them', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const getPostsServiceSpy = spyOn(postService, 'getPosts')
    const deletePostServiceSpy = spyOn(postService, 'deletePosts')

    dialogServiceSpy.and.returnValue(mockDialogResponse)
    getPostsServiceSpy.and.returnValue(of(mockApiResponseWithData))
    deletePostServiceSpy.and.returnValue(of(mockApiResponse))

    const ids = [87,88]
    component.selectedIds = ids

    component.ngOnInit() // Llamamos al ngOnInit, getPosts llamado 1 vez

    component.modalEliminarSeleccionPosts()
    expect(dialogService.openDialog).toHaveBeenCalled()

    component.eliminarPosts()
    expect(postService.deletePosts).toHaveBeenCalledOnceWith(ids)

    postService.refresh$.next() // getPosts llamado 2 veces
    expect(postService.getPosts).toHaveBeenCalledTimes(2)
    done()
  })

  it('should call onSelectionChange when clicking mat-checkbox', () => {
    const onSelectionSpy = spyOn(component, 'onSelectionChange'); // crea espía para onSelectionChange del componente
    const fakeId = [87,88]
    
    fixture.detectChanges(); // Renderiza la tabla
  
    // Localiza el elemento del HTML de newsletters asociado a datatable
    const datatableDE = fixture.debugElement.query(By.directive(DatatableComponent));
    // Accede al componente datatable y sus propiedades mediante una instancia.
    // Como si fuera TestBed.inject(datatableComponent)
    const datatableComponent = datatableDE.componentInstance as DatatableComponent<any>;
  
    // selectionChange es un output de datatable que emite hacia el padre: (selectionChange)="onSelectionChange($event)" en el HTML
    // Hace que se ejecute onSelectionChange de newsletters.component
    datatableComponent.selectionChange.emit(fakeId); // Hacemos que emita manualmente algo y que lo capte el componente
  
    expect(onSelectionSpy).toHaveBeenCalledWith(fakeId);
  })
});
