import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
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
import { PostPartial } from '../../interfaces/post';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-editar',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIcon, MatButtonModule],
  templateUrl: './post-editar.component.html',
  styleUrl: './post-editar.component.scss'
})
export class PostEditarComponent implements OnInit{

  private categoriasService = inject(CategoryService)
  private postService = inject(PostService)
  private snackbar = inject(MatSnackBar)
  private activatedRoute = inject(ActivatedRoute)
  categorias: Category[] = []
  post: PostPartial = {} as PostPartial
  idPost: number = 0

  @ViewChild('imagenActual') imagenActual: ElementRef<HTMLElement> = {} as ElementRef
  @ViewChild('imagenNueva') imagenNueva: ElementRef<HTMLElement> = {} as ElementRef

  filesEndPoint = environment.FilesEndpoint

  postEditarForm = new FormGroup({
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
    this.idPost = this.activatedRoute.snapshot.params['id']
    this.getCategories()
    this.getPost(this.idPost)
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

  getPost (id: number) {
    this.postService.getPostById(id).subscribe({
      next: (respuesta) => {
        this.post = respuesta.data[0]

        this.postEditarForm.patchValue({
          titulo: this.post.titulo,
          slug: this.post.slug,
          contenido: this.post.contenido,
          keywords: this.post.keywords,
          metadescripcion: this.post.metadescription,
          categoria: this.post.categoriaId,
          estado: this.post.estado
        })
      },
      error: (error: HttpErrorResponse) => {
        console.error(error)
      }
    })
  }

  // Permite ocultar la imagen actual para mostrar el input con el que subir la nueva imagen
  nuevaImagen () {
    if(!this.imagenActual.nativeElement.classList.contains('oculto')) {
      this.imagenActual.nativeElement.classList.add('oculto')
    }

    if(this.imagenNueva.nativeElement.classList.contains('oculto')) {
      this.imagenNueva.nativeElement.classList.remove('oculto')
    }
  }

  editarPost () {
    const post = {
      titulo: this.postEditarForm.value.titulo || '',
      slug: this.postEditarForm.value.slug || '',
      contenido: this.postEditarForm.value.contenido || '',
      categoriaId: this.postEditarForm.value.categoria || null, // HAY QUE CONSEGUIR QUE ESTO SÓLO SE ENVIE SI SE ELIGE UNO NUEVO
      estado: this.postEditarForm.value.estado || 'borrador',
      keywords: this.postEditarForm.value.keywords || '',
      metadescription: this.postEditarForm.value.metadescripcion || ''
    }
    if (this.postEditarForm.value.imagen != null) {
      Object.assign(post , {imagen: this.postEditarForm.value.imagen}) // Añadimos la imagen en caso de que se haya seleccionado una nueva
    }

    this.postService.updatePost(this.idPost, post).subscribe({
      next: (respuesta) => {
        this.snackbar.open('Post actualizado.', 'Aceptar', {
          duration: 3000
        })
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
        this.postEditarForm.get('imagen')?.setValue(reader.result as string) // Se asigna postForm.value.imagen a la cadena (string) en base64 con reader.result
      });
      reader.readAsDataURL(file); // Inicia la lectura del archivo dando lugar a data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
    }
  }
}
