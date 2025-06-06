import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AichatComponent } from './aichat.component';
import { GeminiService } from '../../services/api/gemini.service';
import { appConfig } from '../../app.config';
import { Observable, of, throwError } from 'rxjs';
import { Geminiresponse } from '../../interfaces/geminiresponse';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';

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
  enviarPromptAI: () => Observable<Geminiresponse>
} = {
  enviarPromptAI: () => of(mockApiResponse)
}

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
        GeminiService,
        {provide: GeminiService, useValue: mockGeminiService}
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
    
    expect(btnEnviarPrompt).toBeTruthy()

    await btnEnviarPrompt.click() // Hacemos click en el botón para enviar el mensaje a Gemini
    expect(geminiService.enviarPromptAI).toHaveBeenCalled()
    expect(geminiService.enviarPromptAI).toHaveBeenCalledWith(mensajes) // Comprobamos que al servicio le llegan los parámetros correctos
    expect(component.prompt).toBe('') // Después de enviar el mensaje a Gemini, prompt se reinicia
  })

  // ESTE TEST NO DETECTA EL SNACKBAR
  it('should open snackbar when Gemini utility fails', async () => {
    const geminiServiceSpy = spyOn(geminiService, 'enviarPromptAI') // Spy de la función del servicio para enviar y recibir datos con Gemini AI
    geminiServiceSpy.and.returnValue(throwError(() => new Error(mockApiResponseFail.error)))
    component.prompt = '¡Hola!'
    const mensajes = [
      {
        actor: 'user',
        message: '¡Hola!'
      }
    ]

    component.enviarMensajeAi() // Ejecutamos la función para mandar mensaje a la IA

    const snackbarError = await loader.getAllHarnesses(MatSnackBarHarness)
    
    expect(geminiService.enviarPromptAI).toHaveBeenCalled()
    expect(geminiService.enviarPromptAI).toHaveBeenCalledWith(mensajes) // Comprobamos que al servicio le llegan los parámetros correctos
    expect(component.prompt).toBe('') // Después de enviar el mensaje a Gemini, prompt se reinicia
    console.log(snackbarError)
    expect(snackbarError[0]).toBeTruthy() // Ahora no lo detecta
    expect(await snackbarError[0].getMessage()).toBe('El asistente no puede responder. Inténtelo más tarde.')
  })

  it('should format text', () => {
    const text = 'pepe*'
    const formatedText = component.formatearTexto(text)
    expect(formatedText).toBe('pepe')
  })
});
