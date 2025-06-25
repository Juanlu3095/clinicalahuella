import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewslettersComponent } from './newsletters.component';
import { NewsletterService } from '../../services/api/newsletter.service';
import { Observable, of, Subject } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { appConfig } from '../../app.config';
import { DialogService } from '../../services/material/dialog.service';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DatatableComponent } from '../../partials/datatable/datatable.component';

// Mock de la respuesta que no devuelve datos
const mockApiResponse = {
  "message": "Respuesta correcta"
}

// Mock de la respuesta que devuelve datos
const mockApiResponseWithData = {
  "message": "Newsletters encontradas.",
  "data": [
    {
      "id": "67EB08A815F111F084AFD8BBC1B70204",
      "email": "easyshop.notifications@gmail.com",
      "created_at": "2025-04-10T09:51:42.000Z"
    },
    {
      "id": "09C4B8D7293311F08316D8BBC1B70204",
      "email": "jdominguez@gmail.com",
      "created_at": "2025-05-04T21:59:23.000Z"
    },
    {
      "id": "13660335299011F0ABAED8BBC1B70204",
      "email": "jacinto@hotmail.es",
      "created_at": "2025-05-05T09:05:22.000Z"
    },
    {
      "id": "CD2082B7187311F0B6F0D8BBC1B70204",
      "email": "pepa@gmail.com",
      "created_at": "2025-04-13T14:30:09.000Z"
    }
  ]
}

const mockApiResponseWithOneData = {
  "message": "Newsletter encontrada.",
  "data": [
    {
      "id": "67EB08A815F111F084AFD8BBC1B70204",
      "email": "easyshop.notifications@gmail.com",
      "created_at": "2025-04-10T09:51:42.000Z"
    }
  ]
}

const mockDialogResponse = Promise.resolve('confirm')

// Mock del servicio con sus propiedades y métodos
const mockNewsletterService: {
  refresh$: Subject<void>,
  getNewsletters: () => Observable<ApiresponsePartial>,
  getNewsletter: () => Observable<ApiresponsePartial>,
  postNewsletter: () => Observable<ApiresponsePartial>,
  updateNewsletter: () => Observable<ApiresponsePartial>,
  deleteNewsletter: () => Observable<ApiresponsePartial>,
  deleteSelectedNewsletter: () => Observable<ApiresponsePartial>,
} = {
  refresh$: new Subject<void>(),
  getNewsletters: () => of(mockApiResponseWithData), // Hacemos que cada método del servicio nos devuelva un observable simulado
  getNewsletter: () => of(mockApiResponseWithOneData),
  postNewsletter: () => of(mockApiResponse),
  updateNewsletter: () => of(mockApiResponse),
  deleteNewsletter: () => of(mockApiResponse),
  deleteSelectedNewsletter: () => of(mockApiResponse),
}

const mockDialogService: {
  openDialog: () => Promise<any>
} = {
  openDialog: () => Promise.resolve('confirm')
}

describe('NewslettersComponent', () => {
  let component: NewslettersComponent;
  let fixture: ComponentFixture<NewslettersComponent>; // wrapper del componente
  let newsletterService: NewsletterService;
  let dialogService: DialogService;
  let overlayContainer: OverlayContainer; // servicio de angular material para renderizar elementos como matDialog del overlay
  let overlayContainerElement: HTMLElement; // el HTML donde están los elementos del overlay

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewslettersComponent],
      providers: [
        ...appConfig.providers,
        NewsletterService,
        {provide: NewsletterService, useValue: mockNewsletterService}, // En lugar del servicio, le inyecta el mock
        DialogService,
        {provide: DialogService, useValue: mockDialogService}
      ]
    }) // Usamos el provide para indicarle que en lugar del servicio use el mock
    .compileComponents();

    fixture = TestBed.createComponent(NewslettersComponent);
    component = fixture.componentInstance;
    newsletterService = TestBed.inject(NewsletterService)
    dialogService = TestBed.inject(DialogService)
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    //fixture.detectChanges(); // Inicia los hooks, llama a ngOnInit. Si esto se usa, se llama a getNewsletters más veces con el refresh$
  });

  afterEach(() => {
    fixture.destroy() // Se elimina el componente tras cada test, eliminando suscripciones y otras operaciones pendientes
  })

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    component.ngOnInit()
    expect(component.title.getTitle()).toBe('Newsletters < Clínica veterinaria La Huella')
  })

  it('should have all Newsletters in ngOnInit', () => {
    const newsletterServiceSpy = spyOn(newsletterService, 'getNewsletters')
    newsletterServiceSpy.and.returnValue(of(mockApiResponseWithData))
    component.ngOnInit() // Ejecutamos el onInit (IMPORTANTE!! EL ONINIT NO SE LLAMA SOLO!!!)
    expect(newsletterService.getNewsletters).toHaveBeenCalled()
  })

  it('should open modal to create a newsletter', (done: DoneFn) => { // Sólo comprobar si se llama a la función del servicio que abre el modal
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    // Rellenar form y pulsar botón para confirmar el envío
    component.crearNewsForm.patchValue({
      email_nuevo: 'Pepa@gmail.es'
    })
    component.modalCrearNewsletter() // Esta promesa se debe completar clickando el botón
    expect(dialogService.openDialog).toHaveBeenCalled()
    done() // Se puede usar si no uso async/await en el test para terminar las promesas. Aún falta por ejecutarse el snackbar y para que no quede colgado se usa done()
  })

  it('should create a newsletter', (done: DoneFn) => {
    const newsletterServiceSpy = spyOn(newsletterService, 'postNewsletter')
    const newsletterServiceGetAll = spyOn(newsletterService, 'getNewsletters') // mock del getNewsletters del servicio
    newsletterServiceSpy.and.returnValue(of(mockApiResponse))
    newsletterServiceGetAll.and.returnValue(of(mockApiResponseWithData))
    
    component.crearNewsForm.patchValue({
      email_nuevo: 'Pepa@gmail.es'
    })

    const postNewsletter = {
      email: 'Pepa@gmail.es'
    }

    component.ngOnInit(); // Ejecutamos OnInit, llamando a getNewsletters y suscribiéndonos a refresh$
    expect(newsletterService.getNewsletters).withContext('Al ejecutarse ngOnInit por primera vez.').toHaveBeenCalledTimes(1)

    component.crearNewsletter()
    // No es necesario comprobar que se crea el registro, ya lo hacemos en el test del servicio
    newsletterService.refresh$.next() // Emitimos el observable que va a ejecutar getNewsletters en el OnIni

    expect(newsletterService.getNewsletters).withContext('Al borrar una newsletter.').toHaveBeenCalledTimes(2)
    expect(newsletterService.postNewsletter).toHaveBeenCalled()
    expect(newsletterService.postNewsletter).toHaveBeenCalledWith(postNewsletter) // Comprobamos que se le haya pasado el argumento correcto
    done()
  })

  it('should open modal to update a newsletter', (done: DoneFn) => {
    // Abrir modal + getNewsletter
    const newsletterServiceSpy = spyOn(newsletterService, 'getNewsletter')
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')

    newsletterServiceSpy.and.returnValue(of(mockApiResponseWithOneData))
    dialogServiceSpy.and.returnValue(mockDialogResponse)

    component.modalEditarNewsletter('1')

    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(newsletterService.getNewsletter).toHaveBeenCalled()
    expect(newsletterService.getNewsletter).toHaveBeenCalledWith('1') // Comprobamos que se le haya pasado la id correcta al método del servicio
    done()
  })

  it('should update a newsletter', (done: DoneFn) => {
    const newsletterServiceSpy = spyOn(newsletterService, 'updateNewsletter') // mock del updateNewsletter del servicio
    const newsletterServiceGetAll = spyOn(newsletterService, 'getNewsletters') // mock del getNewsletters del servicio
    newsletterServiceSpy.and.returnValue(of(mockApiResponse))
    newsletterServiceGetAll.and.returnValue(of(mockApiResponseWithData))

    component.editarNewsForm.patchValue({
      email_editar: 'pepe@gmail.com'
    })

    const updateNewsletter = { // Lo que le pasamos al método del servicio
      email: 'pepe@gmail.com'
    }

    component.ngOnInit(); // Ejecutamos OnInit, llamando a getNewsletters y suscribiéndonos a refresh$
    expect(newsletterService.getNewsletters).withContext('Al ejecutarse ngOnInit por primera vez.').toHaveBeenCalledTimes(1)

    component.editarNewsletter('1') // Ejecutamos updateNewsletter del servicio
    newsletterService.refresh$.next() // Emitimos el observable que va a ejecutar getNewsletters en el OnIni

    expect(newsletterService.getNewsletters).withContext('Al borrar una newsletter.').toHaveBeenCalledTimes(2)
    expect(newsletterService.updateNewsletter).toHaveBeenCalled()
    expect(newsletterService.updateNewsletter).toHaveBeenCalledWith('1', updateNewsletter) // Comprobamos que se le haya pasado los argumentos al método del servicio
    done()
  })

  it('should open modal to delete a newsletter', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    const newsletterServiceSpy = spyOn(newsletterService, 'getNewsletter')

    dialogServiceSpy.and.returnValue(mockDialogResponse)
    newsletterServiceSpy.and.returnValue(of(mockApiResponse))

    component.modalDeleteNewsletter('1')

    expect(dialogService.openDialog).toHaveBeenCalled()
    expect(newsletterService.getNewsletter).toHaveBeenCalled()
    expect(newsletterService.getNewsletter).toHaveBeenCalledWith('1') // Comprobamos que se le haya pasado la id correcta al método del servicio
    done()
  })

  it('should delete a newsletter', (done: DoneFn) => {
    const newsletterServiceSpy = spyOn(newsletterService, 'deleteNewsletter')
    const newsletterComponentGetAllSpy = spyOn(newsletterService, 'getNewsletters')
    newsletterServiceSpy.and.returnValue(of(mockApiResponse))
    newsletterComponentGetAllSpy.and.returnValue(of(mockApiResponseWithData))

    component.ngOnInit();
    expect(newsletterService.getNewsletters).withContext('Al ejecutarse ngOnInit por primera vez.').toHaveBeenCalledTimes(1)
    
    component.eliminarNewsletter('1')
    newsletterService.refresh$.next()

    expect(newsletterService.getNewsletters).withContext('Al borrar una newsletter.').toHaveBeenCalledTimes(2)

    expect(newsletterService.deleteNewsletter).toHaveBeenCalled()
    expect(newsletterService.deleteNewsletter).toHaveBeenCalledWith('1') // Comprobamos que se le haya pasado '1' como argumento del método del servicio
    done()
  })

  it('should open modal to delete a selection of newsletters', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(mockDialogResponse)

    component.modalEliminarSeleccionNewsletters()

    expect(dialogService.openDialog).toHaveBeenCalled()
    done()
  })

  it('should delete a selection of newsletters', (done: DoneFn) => {
    const newsletterServiceSpy = spyOn(newsletterService, 'deleteSelectedNewsletter') // mock del deleteSelection del servicio
    const newsletterComponentGetAllSpy = spyOn(newsletterService, 'getNewsletters') // mock del getNewsletters del servicio
    newsletterServiceSpy.and.returnValue(of(mockApiResponse))
    newsletterComponentGetAllSpy.and.returnValue(of(mockApiResponseWithData))

    component.ngOnInit(); // Se ejecuta getNewsletters y nos suscribimos a refresh$
    expect(newsletterService.getNewsletters).withContext('Al ejecutarse ngOnInit por primera vez.').toHaveBeenCalledTimes(1)

    component.eliminarSeleccionNewsletters() // Se ejecuta la eliminación
    newsletterService.refresh$.next() // Se emite el observable

    expect(newsletterService.deleteSelectedNewsletter).toHaveBeenCalled()
    expect(newsletterService.getNewsletters).withContext('Al borrar newsletters.').toHaveBeenCalledTimes(2)
    done()
  })

  it('should call onSelectionChange when clicking mat-checkbox', () => {
    const onSelectionSpy = spyOn(component, 'onSelectionChange'); // crea espía para onSelectionChange del componente

    fixture.detectChanges(); // Renderiza la tabla

    // Localiza el elemento del HTML de newsletters asociado a datatable
    const datatableDE = fixture.debugElement.query(By.directive(DatatableComponent));
    // Accede al componente datatable y sus propiedades mediante una instancia.
    // Como si fuera TestBed.inject(datatableComponent)
    const datatableComponent = datatableDE.componentInstance as DatatableComponent<any>;

    // selectionChange es un output de datatable que emite hacia el padre: (selectionChange)="onSelectionChange($event)" en el HTML
    // Hace que se ejecute onSelectionChange de newsletters.component
    datatableComponent.selectionChange.emit(['fakeId']); // Hacemos que emita manualmente algo y que lo capte el componente

    expect(onSelectionSpy).toHaveBeenCalledWith(['fakeId']);
  })
});
