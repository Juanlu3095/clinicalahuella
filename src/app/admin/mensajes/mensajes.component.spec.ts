import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesComponent } from './mensajes.component';
import { Observable, of, Subject } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { appConfig } from '../../app.config';
import { MessageService } from '../../services/api/message.service';
import { DialogService } from '../../services/material/dialog.service';
import { By } from '@angular/platform-browser';
import { DatatableComponent } from '../../partials/datatable/datatable.component';

// Mock de la respuesta que no devuelve datos
const mockApiResponse = {
  "message": "Respuesta correcta"
}

// Mock de la respuesta que devuelve datos
const mockApiResponseWithData = {
  "message": "Mensajes encontrados.",
  "data": [
    {
      "id": "67EEBF5A15F111F084AFD8BBC1B70204",
      "nombre": "Alberto",
      "apellidos": "Pepep",
      "email": "peasi@gmail.com",
      "telefono": 952222222,
      "asunto": "Hola qué tal",
      "mensaje": "Este es el mensaje creado.",
      "created_at": "2025-04-10T09:51:42.000Z",
      "updated_at": "2025-04-25T18:24:24.000Z"
    },
    {
      "id": "5EA6706C303311F09828D8BBC1B70204",
      "nombre": "Pepito",
      "apellidos": "Jiménez",
      "email": "pjimenez@gmail.es",
      "telefono": 111111111,
      "asunto": "Hola",
      "mensaje": "a",
      "created_at": "2025-05-13T19:49:23.000Z",
      "updated_at": "2025-05-13T22:13:04.000Z"
    }
  ]
}

const mockApiResponseWithOneData = {
  "message": "Mensaje encontrado.",
  "data": {
    "id": "67EEBF5A15F111F084AFD8BBC1B70204",
    "nombre": "Alberto",
    "apellidos": "Pepep",
    "email": "peasi@gmail.com",
    "telefono": 952222222,
    "asunto": "Hola qué tal",
    "mensaje": "Este es el mensaje creado.",
    "created_at": "2025-04-10T09:51:42.000Z",
    "updated_at": "2025-04-25T18:24:24.000Z"
  }
}

const mockDialogResponse = Promise.resolve('confirm')

// Mock del servicio con sus propiedades y métodos
const mockMensajeService: {
  refresh$: Subject<void>,
  getMessages: () => Observable<ApiresponsePartial>,
  getMessage: () => Observable<ApiresponsePartial>,
  postMessage: () => Observable<ApiresponsePartial>,
  updateMessage: () => Observable<ApiresponsePartial>,
  deleteMessage: () => Observable<ApiresponsePartial>,
  deleteMessages: () => Observable<ApiresponsePartial>,
} = {
  refresh$: new Subject<void>(),
  getMessages: () => of(mockApiResponseWithData), // Hacemos que cada método del servicio nos devuelva un observable simulado
  getMessage: () => of(mockApiResponseWithOneData),
  postMessage: () => of(mockApiResponse),
  updateMessage: () => of(mockApiResponse),
  deleteMessage: () => of(mockApiResponse),
  deleteMessages: () => of(mockApiResponse),
}

const mockDialogService: {
  openDialog: () => Promise<any>
} = {
  openDialog: () => Promise.resolve('confirm')
}

describe('MensajesComponent', () => {
  let component: MensajesComponent;
  let fixture: ComponentFixture<MensajesComponent>;
  let messageService: MessageService;
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajesComponent],
      providers: [
        ...appConfig.providers,
        MessageService,
        {provide: MessageService, useValue: mockMensajeService},
        DialogService,
        {provide: DialogService, useValue: mockDialogService}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajesComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService)
    dialogService = TestBed.inject(DialogService)
    //fixture.detectChanges(); // A la hora de contar las llamadas al servicio del ngOnInit, esta cuenta para cada test
  });

  afterEach(() => {
    fixture.destroy() // Se elimina el componente tras cada test, eliminando suscripciones y otras operaciones pendientes
    //component.ngOnDestroy()
  })

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    component.ngOnInit()
    expect(component.title.getTitle()).toBe('Mensajes < Clínica veterinaria La Huella')
  })

  it('should have all messages when ngOnInit is called', () => {
    const messageServiceSpy = spyOn(messageService, 'getMessages')
    messageServiceSpy.and.returnValue(of(mockApiResponseWithData))
    component.ngOnInit()
    expect(messageService.getMessages).toHaveBeenCalled()
  })

  it('should open a modal to see a specific message', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    const messageServiceSpy = spyOn(messageService, 'getMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponseWithData))

    component.modalVerMensaje("67EEBF5A15F111F084AFD8BBC1B70204")

    expect(dialogServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalledWith("67EEBF5A15F111F084AFD8BBC1B70204")
    done()
  })

  it('should get a specific message', (done: DoneFn) => {
    const messageServiceSpy = spyOn(messageService, 'getMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponseWithOneData))

    component.getMensaje("67EEBF5A15F111F084AFD8BBC1B70204")
    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalledWith("67EEBF5A15F111F084AFD8BBC1B70204")
    done()
  })

  it('should open a modal to create a message', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))

    component.modalPostMensaje()

    expect(dialogServiceSpy).toHaveBeenCalled()
    done()
  })

  it('should create a message', (done: DoneFn) => {
    const messageServiceSpy = spyOn(messageService, 'postMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponse))
    const messageServiceGetAllSpy = spyOn(messageService, 'getMessages')
    messageServiceGetAllSpy.and.returnValue(of(mockApiResponseWithData))

    component.ngOnInit()

    component.crearMensajeForm.patchValue({
      nombre_nuevo: 'Pepe',
      apellidos_nuevo: 'Pérez',
      email_nuevo: 'pperez@gmail.com',
      telefono_nuevo: '644111222',
      asunto_nuevo: 'Prueba test',
      mensaje_nuevo: 'Éste es el mensaje de la prueba para test'
    })

    const message = {
      nombre: 'Pepe',
      apellidos: 'Pérez',
      email: 'pperez@gmail.com',
      telefono: '644111222',
      asunto: 'Prueba test',
      mensaje: 'Éste es el mensaje de la prueba para test'
    }

    component.postMensaje()
    messageService.refresh$.next()

    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalledWith(message)
    expect(messageServiceGetAllSpy).toHaveBeenCalledTimes(2)
    done()
  })

  it('should open a modal to update a specific message', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    const messageServiceSpy = spyOn(messageService, 'getMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponseWithData))

    component.modalUpdateMensaje("67EEBF5A15F111F084AFD8BBC1B70204")

    expect(dialogServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalledWith("67EEBF5A15F111F084AFD8BBC1B70204")
    done()
  })

  it('should update a specific message', (done: DoneFn) => {
    const messageServiceSpy = spyOn(messageService, 'updateMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponse))
    const messageServiceGetAllSpy = spyOn(messageService, 'getMessages')
    messageServiceGetAllSpy.and.returnValue(of(mockApiResponseWithData))

    component.ngOnInit()

    component.editarMensajeForm.patchValue({
      nombre_editar: 'Pepe',
      apellidos_editar: 'Pérez',
      email_editar: 'pperez@gmail.com',
      telefono_editar: '644111222',
      asunto_editar: 'Prueba test',
      mensaje_editar: 'Éste es el mensaje de la prueba para test'
    })

    const message = {
      nombre: 'Pepe',
      apellidos: 'Pérez',
      email: 'pperez@gmail.com',
      telefono: '644111222',
      asunto: 'Prueba test',
      mensaje: 'Éste es el mensaje de la prueba para test'
    }

    component.updateMensaje("67EEBF5A15F111F084AFD8BBC1B70204")
    messageService.refresh$.next()

    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalledWith("67EEBF5A15F111F084AFD8BBC1B70204", message) // SE COMPRUEBA LOS ARGUMENTOS DEL MÉTODO DEL SERVICIO
    expect(messageServiceGetAllSpy).toHaveBeenCalledTimes(2)
    done()
  })

  it('should open a modal to delete a specific message', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))
    const messageServiceSpy = spyOn(messageService, 'getMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponseWithData))

    component.modalDeleteMensaje("67EEBF5A15F111F084AFD8BBC1B70204")

    expect(dialogServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceSpy).toHaveBeenCalledWith("67EEBF5A15F111F084AFD8BBC1B70204")
    done()
  })

  it('should delete a specific message', (done: DoneFn) => {
    const messageServiceSpy = spyOn(messageService, 'deleteMessage')
    messageServiceSpy.and.returnValue(of(mockApiResponse))
    const messageServiceGetAllSpy = spyOn(messageService, 'getMessages')
    messageServiceGetAllSpy.and.returnValue(of(mockApiResponseWithData))

    component.ngOnInit()

    component.deleteMensaje("67EEBF5A15F111F084AFD8BBC1B70204")
    messageService.refresh$.next()

    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceGetAllSpy).toHaveBeenCalledTimes(2)
    expect(messageServiceSpy).toHaveBeenCalledWith("67EEBF5A15F111F084AFD8BBC1B70204")
    done()
  })

  it('should open a modal to delete a selection of messages', (done: DoneFn) => {
    const dialogServiceSpy = spyOn(dialogService, 'openDialog')
    dialogServiceSpy.and.returnValue(Promise.resolve('confirm'))

    component.modalDeleteSeleccionMensajes()

    expect(dialogServiceSpy).toHaveBeenCalled()
    done()
  })

  it('should delete a selection of messages', (done: DoneFn) => {
    const messageServiceSpy = spyOn(messageService, 'deleteMessages')
    messageServiceSpy.and.returnValue(of(mockApiResponse))
    const messageServiceGetAllSpy = spyOn(messageService, 'getMessages')
    messageServiceGetAllSpy.and.returnValue(of(mockApiResponseWithData))

    component.ngOnInit() // Si a messageServiceGetAllSpy no se le pasa mockApiResponseWithData dará undefined en el forEach porque no tiene el 'data'

    component.selectedIds = ["67EEBF5A15F111F084AFD8BBC1B70204", "5EA6706C303311F09828D8BBC1B70204"]
    component.deleteMensajes()
    messageService.refresh$.next()

    expect(messageServiceSpy).toHaveBeenCalled()
    expect(messageServiceGetAllSpy).toHaveBeenCalledTimes(2)
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
