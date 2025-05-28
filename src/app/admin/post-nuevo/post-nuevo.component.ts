import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CategoryService } from '../../services/api/category.service';
import { Category } from '../../interfaces/category';
import { ApiresponsePartial } from '../../interfaces/apiresponse';
import { PostService } from '../../services/api/post.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-nuevo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIcon, MatButtonModule],
  templateUrl: './post-nuevo.component.html',
  styleUrl: './post-nuevo.component.scss'
})
export class PostNuevoComponent implements OnInit{

  private categoriasService = inject(CategoryService)
  private postService = inject(PostService)
  private snackbar = inject(MatSnackBar)
  private router = inject(Router)
  categorias: Category[] = []

  postForm = new FormGroup({
    titulo: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    slug: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    contenido: new FormControl<string>('', Validators.compose([Validators.required, Validators.minLength(1)])),
    categoria: new FormControl<number | null>(null),
    imagen: new FormControl<string | null>(null, Validators.minLength(1)),
    estado: new FormControl<string>('borrador', Validators.compose([Validators.required, Validators.minLength(1)])),
    keywords: new FormControl<string>('', Validators.minLength(1)),
    metadescripcion: new FormControl<string>('', Validators.minLength(1))
  })

  ngOnInit(): void {
    this.getCategories()
  }

  getCategories () {
    this.categoriasService.getCategories().subscribe({
      next: (respuesta: ApiresponsePartial) => {
        this.categorias = respuesta.data
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.snackbar.open('Categorías no encontradas.', 'Aceptar', {
            duration: 3000
          })
        } else {
          this.snackbar.open('Error al obtener las categorías.', 'Aceptar', {
          duration: 3000
        })
        }
      }
    })
  }

  crearPost () {
    const post = {
      titulo: this.postForm.value.titulo || '',
      slug: this.postForm.value.slug || '',
      contenido: this.postForm.value.contenido || '',
      categoriaId: this.postForm.value.categoria || null,
      imagen: this.postForm.value.imagen || null,
      estado: this.postForm.value.estado || 'borrador',
      keywords: this.postForm.value.keywords || '',
      metadescripcion: this.postForm.value.metadescripcion || ''
    }
    this.postService.postPost(post).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Post creado.', 'Aceptar', {
          duration: 3000
        })
        // Redireccionamos a la página para editar la entrada
        this.router.navigate([`admin/blog/${respuesta.data}/editar`])
      },
      error: (error) => {
        this.snackbar.open('Ha ocurrido un error.', 'Aceptar', {
          duration: 3000
        })
      }
    })
  }

  // Permite cargar un archivo desde el input, obtener su contenido en base64 y guardarlo en postForm.value.imagen
  setFileData(event: Event): void {
    const eventTarget: HTMLInputElement | null = event.target as HTMLInputElement | null; // Convierte el eventTarget a HTMLInput para usar sus métodos
    if (eventTarget?.files?.[0]) { // Verifica que haya un archivo en el evento
      const file: File = eventTarget.files[0]; // Obtenemos el archivo seleccionado en el input
      const reader = new FileReader(); // Instancia para poder leer los archivos
      reader.addEventListener('load', () => { // Se ejecuta cuando haya terminado de leer el archivo
        this.postForm.get('imagen')?.setValue(reader.result as string) // Se asigna postForm.value.imagen a la cadena (string) en base64 con reader.result
      });
      reader.readAsDataURL(file); // Inicia la lectura del archivo dando lugar a data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    }
  }
}
