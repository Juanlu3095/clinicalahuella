import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { MessageService } from "./message.service";
import { TestBed } from '@angular/core/testing';
import { Message, MessagePartial } from '../../interfaces/message';
import { Apiresponse, ApiresponsePartial } from '../../interfaces/apiresponse';
import { map } from 'rxjs'

// Función global de Jasmine para los tests
describe('MessageService', () => {
  let apiService: MessageService
  let httpMock: HttpTestingController // Controlador para mockear peticiones, para simularlas, no API real
  const baseUrl = 'http://localhost:3000/messages' // Url que simulamos

  // Se ejecuta antes de cada 'it' para realizar configuraciones
  beforeEach(() => {
    TestBed.configureTestingModule({ // TestBed es un wrapper del componente que nos da funciones para probar la app
      // Aquí tenemos que pasar las configuración de nuestro componente para funcionar también con los tests
      imports: [HttpClientTestingModule],
      providers: []
    })

    // Reasignamos variables para que utilice la configuración del entorno de pruebas
    apiService = TestBed.inject(MessageService)
    httpMock = TestBed.inject(HttpTestingController)
  });

  // Se ejecuta esto tras cada test
  afterEach(() => {
    httpMock.verify() // Finaliza cualquier petición asíncrona no terminada con un mensaje con las peticiones pendientes
  })

  // xit para excluir test, fit sólo se ejecuta ese test
  it('should get all messages', () => {
    // Datos para simular en este test específico. También se podría crear un archivo con datos que usar en el resto de tests
    const dummyMessages: Message[] = [
      {
        "id": "67EEBF5A15F111F084AFD8BBC1B70204",
        "nombre": "Pepe",
        "apellidos": "López",
        "email": "pepe@gmail.com",
        "telefono": '951248550',
        "asunto": "Pregunta cita",
        "mensaje": "Hola, éste es un mensaje",
        "created_at": new Date("2025-04-10T09:51:42.000Z"),
        "updated_at": new Date("2025-04-10T09:51:42.000Z")
      },
      {
        "id": "67EEBF5A15F111F084AFD8BBC1B70205",
        "nombre": "Pepe",
        "apellidos": "Romero",
        "email": "promero@gmail.com",
        "telefono": '951221111',
        "asunto": "Pregunta cita numero 2",
        "mensaje": "Hola, éste es un mensaje 2",
        "created_at": new Date("2025-04-11T09:51:42.000Z"),
        "updated_at": new Date("2025-04-11T09:51:42.000Z")
      }
    ]
    // Respuesta completa que vamos a simular: Message + data
    const dummyResponse = {
      "message": "Mensajes encontrados.",
      "data": [
        {
          "id": "67EEBF5A15F111F084AFD8BBC1B70204",
          "nombre": "Pepe",
          "apellidos": "López",
          "email": "pepe@gmail.com",
          "telefono": 951248550,
          "asunto": "Pregunta cita",
          "mensaje": "Hola, éste es un mensaje",
          "created_at": new Date("2025-04-10T09:51:42.000Z"),
          "updated_at": new Date("2025-04-10T09:51:42.000Z")
        },
        {
          "id": "67EEBF5A15F111F084AFD8BBC1B70205",
          "nombre": "Pepe",
          "apellidos": "Romero",
          "email": "promero@gmail.com",
          "telefono": 951221111,
          "asunto": "Pregunta cita numero 2",
          "mensaje": "Hola, éste es un mensaje 2",
          "created_at": new Date("2025-04-11T09:51:42.000Z"),
          "updated_at": new Date("2025-04-11T09:51:42.000Z")
        }
      ]
    }

    // apiService es una instancia del servicio de la API real
    apiService.getMessages().pipe(
      map((apiresponse: ApiresponsePartial) => {
        return apiresponse.data
      })
    ).subscribe((messages: Message[]) => {
      expect(messages.length).toBe(2) // toBe es un matcher
      expect(messages).toEqual(dummyMessages) // Estamos comparando solo el 'data' de toda la respuesta
    })

    const req = httpMock.expectOne(baseUrl) // Comprobamos con expectOne que el servicio haga una sola petición a baseUrl realmente
    expect(req.request.method).toBe('GET') // Esperamos que el método de la petición sea GET

    // Resuelve la petición y devuelve lo que nosotros queramos. dummyReponse es la respuesta entera, tanto message como data,
    // que es lo que devuelve la petición HTTP interceptada por HTTPTestingController
    req.flush(dummyResponse)
  });
  
  it('should get a message by id', () => {
    const idMessage = '67EEBF5A15F111F084AFD8BBC1B70204'
    // Datos para simular en este test específico. También se podría crear un archivo con datos que usar en el resto de tests
    const dummyMessage: Message = {
      "id": "67EEBF5A15F111F084AFD8BBC1B70204",
      "nombre": "Pepe",
      "apellidos": "López",
      "email": "pepe@gmail.com",
      "telefono": '951248550',
      "asunto": "Pregunta cita",
      "mensaje": "Hola, éste es un mensaje",
      "created_at": new Date("2025-04-10T09:51:42.000Z"),
      "updated_at": new Date("2025-04-10T09:51:42.000Z")
    }
    // Respuesta completa que vamos a simular: Message + data
    const dummyResponse = {
      "message": "Mensaje encontrado.",
      "data": {
        "id": "67EEBF5A15F111F084AFD8BBC1B70204",
        "nombre": "Pepe",
        "apellidos": "López",
        "email": "pepe@gmail.com",
        "telefono": 951248550,
        "asunto": "Pregunta cita",
        "mensaje": "Hola, éste es un mensaje",
        "created_at": new Date("2025-04-10T09:51:42.000Z"),
        "updated_at": new Date("2025-04-10T09:51:42.000Z")
      }
    }

    // apiService es una instancia del servicio de la API real
    apiService.getMessage('67EEBF5A15F111F084AFD8BBC1B70204').pipe(
      map((apiresponse: ApiresponsePartial) => {
        return apiresponse.data
      })
    ).subscribe((message: Message) => {
      expect(message).toEqual(dummyMessage) // Estamos comparando solo el 'data' de toda la respuesta
    })

    const req = httpMock.expectOne(`${baseUrl}/${idMessage}`) // Petición simulada
    expect(req.request.method).toBe('GET') // Esperamos que el método de la petición sea GET

    // Resuelve la petición y devuelve lo que nosotros queramos. dummyReponse es la respuesta entera, tanto message como data
    req.flush(dummyResponse)
  });

  it('should create a message', () => {
    const dummyMessage: MessagePartial = {
      "nombre": "Jacinto",
      "apellidos": "Gutiérrez",
      "email": "jguti@gmail.com",
      "telefono": '951248860',
      "asunto": "Crear mensaje",
      "mensaje": "Hola, ésta es una prueba para crear un mensaje"
    }

    const dummyResponse = {
      "message": "Mensaje enviado."
    }

    apiService.postMessage(dummyMessage).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toEqual(dummyResponse)
      expect(respuesta.error).toBeUndefined() // Se espera que no haya error
    })

    const req = httpMock.expectOne(baseUrl)
    expect(req.request.method).toBe('POST')
    req.flush(dummyResponse)
  });
  
  it('should update a message', () => {
    const idMessage = '67EEBF5A15F111F084AFD8BBC1B70204'
    const dummyMessage: MessagePartial = {
      "nombre": "Pepe",
      "apellidos": "Gutiérrez",
      "email": "jguti@gmail.com",
      "telefono": '951248860',
      "asunto": "Crear mensaje",
      "mensaje": "Hola, ésta es una prueba para crear un mensaje"
    }

    const dummyResponse = {
      "message": "Mensaje actualizado.",      
    }

    apiService.updateMessage(idMessage, dummyMessage).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toEqual(dummyResponse)
      expect(respuesta.error).toBeUndefined() // Se espera que no haya error
    })

    const req = httpMock.expectOne(`${baseUrl}/${idMessage}`)
    expect(req.request.method).toBe('PATCH')
    req.flush(dummyResponse)
  });

  it('should delete a message', () => {
    const idMessage = '67EEBF5A15F111F084AFD8BBC1B70204'

    const dummyResponse = {
      "message": "Mensaje eliminado.",      
    }

    apiService.deleteMessage(idMessage).subscribe((respuesta: ApiresponsePartial) => {
      expect(respuesta).toEqual(dummyResponse)
      expect(respuesta.error).toBeUndefined() // Se espera que no haya error
    })

    const req = httpMock.expectOne(`${baseUrl}/${idMessage}`)
    expect(req.request.method).toBe('DELETE')
    req.flush(dummyResponse)
  });

});
