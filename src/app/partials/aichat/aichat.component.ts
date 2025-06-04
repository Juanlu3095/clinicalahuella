import { Component, ElementRef, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from '../../partials/skeleton/skeleton.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/api/gemini.service';
import { Geminiresponse } from '../../interfaces/geminiresponse';

@Component({
  selector: 'app-aichat',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, FormsModule, SkeletonComponent, CommonModule],
  templateUrl: './aichat.component.html',
  styleUrl: './aichat.component.scss'
})
export class AichatComponent {

  @ViewChild('chatHistory') historialChat!: ElementRef;
  private geminiService = inject(GeminiService)
  private snackbar = inject(MatSnackBar)
  prompt: string = ''; // El mensaje que se le envía a Gemini AI. Necesitamos el import de FormsModule para que NgModel funcione
  loading: boolean = false; // Para desactivar el botón de enviar mensaje mientras Gemini AI procesa la respuesta
  chatMessages: any[] = []; // Guarda los mensajes del usuario y del bot

  enviarMensajeAi() {
    if(this.prompt && !this.loading) {
      this.loading = true;
      this.historialChat.nativeElement.scrollTop = this.historialChat.nativeElement.scrollHeight // Baja el scroll para ver el último mensaje
      const data = this.prompt;
      this.chatMessages.push({ actor: 'user', message: data })
      this.prompt = '';
      this.geminiService.enviarPromptAI(this.chatMessages).subscribe({
        next: (respuesta: Geminiresponse) => {
          this.chatMessages.push({actor: 'model', message: respuesta.candidates[0].content.parts[0].text })
          this.historialChat.nativeElement.scrollTop = this.historialChat.nativeElement.scrollHeight
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.snackbar.open('El asistente no puede responder. Inténtelo más tarde.', 'Aceptar', {
            duration: 3000
          })
        }
      });
    }
  }
  
  formatearTexto(text: string) {
    const result = text.replaceAll('*', '');
    return result;
  }
}
