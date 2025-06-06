import { TestBed } from '@angular/core/testing';

import { GeminiService } from './gemini.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Geminiresponse } from '../../interfaces/geminiresponse';

describe('GeminiService', () => {
  let service: GeminiService;
  let httpTestingController: HttpTestingController; // Para crear datos simulados
  const baseUrl = 'http://localhost:3000/ai' // Url que simulamos

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(GeminiService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify() // Nos aseguramos de que no se ejecute otra petición http pendiente mientras se realiza un test
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a response from Gemini AI', () => {
    const dummyChatHistory = [
      {
        "actor": "user",
        "message": "¡Hola!"
      }
    ]

    const dummyResponse = {
      "candidates" : [
        {
          "content": {
            "parts": [
              {
                "text": "¡Hola! ¿En qué puedo ayudarte hoy?\n"
              }
            ],
            "role": "model"
          }
        }
      ] 
    }

    service.enviarPromptAI(dummyChatHistory).subscribe((respuesta: Geminiresponse) => {
      expect(respuesta).toBeTruthy() // Comprobamos que los datos llegan
      expect(respuesta.candidates[0].content.role).toBe('model')
      expect(respuesta.candidates[0].content.parts[0].text).toBe('¡Hola! ¿En qué puedo ayudarte hoy?\n')
    })
    const mockRequest = httpTestingController.expectOne(baseUrl) // Hacemos la petición
    expect(mockRequest.request.method).toEqual('POST')

    // flush debe ir siempre después de la suscripción al método del servicio, ya que éste espera resolver la petición, la cual no lo
    // hace porque es simulada con provideHttpClientTesting y HttpTestingController. Sin el flush, la petición se queda esperando
    // para siempre.
    mockRequest.flush(dummyResponse)
  })
});
