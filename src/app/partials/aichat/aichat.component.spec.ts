import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AichatComponent } from './aichat.component';
import { GeminiService } from '../../services/api/gemini.service';
import { appConfig } from '../../app.config';
import { Observable, of, throwError } from 'rxjs';
import { Geminiresponse } from '../../interfaces/geminiresponse';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

// Mock de la respuesta que no devuelve datos
const mockApiResponse = {
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
  ],
  modelversion: '',
  usageMetadata: {}
}

const mockApiResponseFail = {
  "error": "Ha ocurrido un error con su petición."
}

// Mock del servicio con sus propiedades y métodos
const mockGeminiService: {
  enviarPromptAI: (chatMessages: any[]) => Observable<Geminiresponse>
} = {
  enviarPromptAI: () => of(mockApiResponse)
}

// Creamos un espia con createSpyObj en lugar de spyOn porque no tenemos una instancia de MatSnackBa, Angular la crea y la inyecta directamente
const mockSnackbar = jasmine.createSpyObj(['open']); // Creamos un objeto sin nombre ni clase, sólo con la propiedad 'open', la cual espia al metodo open() de MatSnackBar

describe('AichatComponent', () => {
  let component: AichatComponent;
  let fixture: ComponentFixture<AichatComponent>;
  let geminiService: GeminiService;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AichatComponent],
      providers: [
        ...appConfig.providers,
        { provide: GeminiService, useValue: mockGeminiService },
        { provide: MatSnackBar, useValue: mockSnackbar },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AichatComponent);
    component = fixture.componentInstance;
    geminiService = TestBed.inject(GeminiService)
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  afterEach(() => {
    sessionStorage.setItem('aichat', JSON.stringify([])) // Limpiamos los mensajes de sessionStorage para el buen funcionamiento de los tests
    fixture.destroy() // Se elimina el componente tras cada test, eliminando suscripciones y otras operaciones pendientes
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send a prompt and receive a response from Gemini AI', async () => {
    const btnEnviarPrompt = await loader.getHarness(MatButtonHarness.with({ selector: '#send-button'}))
    const geminiServiceSpy = spyOn(geminiService, 'enviarPromptAI') // Spy de la función del servicio para enviar y recibir datos con Gemini AI
    geminiServiceSpy.and.returnValue(of(mockApiResponse))
    component.prompt = '¡Hola!'
    const mensajes = [
      {
        actor: 'user',
        message: '¡Hola!'
      }
    ]
    const historialCompleto = [
      {
        actor: 'user',
        message: '¡Hola!'
      },
      {
        actor: 'model',
        message: "¡Hola! ¿En qué puedo ayudarte hoy?\n"
      }
    ]
    
    expect(btnEnviarPrompt).toBeTruthy()

    await btnEnviarPrompt.click() // Hacemos click en el botón para enviar el mensaje a Gemini
    expect(geminiService.enviarPromptAI).toHaveBeenCalledWith(mensajes) // Comprobamos que al servicio le llegan los parámetros correctos
    expect(component.prompt).toBe('') // Después de enviar el mensaje a Gemini, prompt se reinicia
    expect(JSON.parse(sessionStorage.getItem('aichat')!)).toEqual(historialCompleto)
  })

  // ESTE TEST NO DETECTA EL SNACKBAR
  it('should open snackbar when Gemini utility fails', async () => {
    const geminiServiceSpy = spyOn(geminiService, 'enviarPromptAI') // Spy de la función del servicio para enviar y recibir datos con Gemini AI
    geminiServiceSpy.and.returnValue(throwError(() => ({
      status: 500,
      message: mockApiResponseFail.error
    })))
    component.prompt = '¡Hola!'
    const mensajes = [
      {
        actor: 'user',
        message: '¡Hola!'
      }
    ]

    component.enviarMensajeAi() // Ejecutamos la función para mandar mensaje a la IA

    expect(mockGeminiService.enviarPromptAI).toHaveBeenCalledWith(mensajes) // Comprobamos que al servicio le llegan los parámetros correctos
    expect(component.prompt).toBe('') // Después de enviar el mensaje a Gemini, prompt se reinicia
    expect(mockSnackbar.open).toHaveBeenCalledWith('El asistente no puede responder. Inténtelo más tarde.', 'Aceptar', {
      duration: 3000,
      panelClass: '.snackerror'
    })
  })

  it('should format text', () => {
    const text = 'pepe*'
    const formatedText = component.formatearTexto(text)
    expect(formatedText).toBe('pepe')
  })
});
