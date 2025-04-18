import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CategoryService } from '../../services/api/category.service';
import { DialogService } from '../../services/material/dialog.service';
import { Category } from '../../interfaces/category';
import { Subscription } from 'rxjs';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { TableButton } from '../../interfaces/tablebutton';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatatableService } from '../../services/material/datatable.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [DatatableComponent,  MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule, ReactiveFormsModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss'
})
export class CategoriasComponent implements OnInit{
  
  private categoryService = inject(CategoryService)
  private snackbar = inject(MatSnackBar)
  private datatableService = inject(DatatableService)
  public categorias: Category[] = []
  public categoria: Category = {} as Category
  columns: string[] = ['nombre']
  displayedColumns = ['select',...this.columns, 'acciones'];
  selectedIds: number[] = []; // Parece que cuando se eliminan ids y se vuelve a seleccionar otros, los antiguos siguen aquí!!!
  suscripcion: Subscription = new Subscription();

  public botones: TableButton[] = [
    {id: 1, nombre: 'Editar', class: 'editar', accion: (id:number) => this.editarCategoria(id) }, // () => para poder usar this..., le pasamos la id del mensaje
    {id: 2, nombre: 'Eliminar', class: 'danger', accion: (id: number) => this.deleteCategoria(id)},
  ]

  @ViewChild('contentEditar') modalEditar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminar') modalEliminar!: TemplateRef<HTMLElement>;
  @ViewChild('contentEliminarSeleccion') modalEliminarSeleccion!: TemplateRef<HTMLElement>;

  constructor(private dialogService: DialogService) {}

  crearCategoriaForm = new FormGroup({
    nombre: new FormControl('', Validators.required)
  });

  editarCategoriaForm = new FormGroup({
    nombre_editar: new FormControl('', Validators.required)
  });
  
  ngOnInit(): void {
    this.getCategorias()

    this.categoryService.refresh$.subscribe(() => {
      this.getCategorias()
    })
  }

  getCategorias(): void {
    this.categoryService.getCategories().subscribe({
      next: (respuesta) => {
        this.categorias = respuesta.data
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  postCategoria() {
    if(this.crearCategoriaForm.valid) {
      let categoria = {
        nombre: this.crearCategoriaForm.value.nombre || ''
      }
      this.categoryService.postCategory(categoria).subscribe({
        next: (respuesta) => {
          this.snackbar.open('Categoría creada.', 'Aceptar', {
            duration: 3000
          })
        },
        error: (error) => {
          console.error(error)
        }
      })
    }
  }

  editarCategoria(id: number) {
    let title: string = 'Editar categoría'; // Título del modal
    let btnClass = 'guardar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.categoryService.getCategory(id).subscribe((respuesta) => {
      this.editarCategoriaForm.patchValue({
        nombre_editar: respuesta.data[0].nombre
      })
    })

    this.dialogService.openDialog(this.modalEditar, title, btnClass, btnCancel).then(confirm => {
      if(confirm && this.editarCategoriaForm.valid) {
        let categoria = {
          nombre: this.editarCategoriaForm.value.nombre_editar || ''
        }

        this.categoryService.updateCategory(id, categoria).subscribe({
          next: (respuesta) => {
            this.snackbar.open('Categoría actualizada.', 'Aceptar', {
              duration: 3000
            })
          },
          error: (error) => {
            console.error(error)
          }
        })
      }
    })
  }

  deleteCategoria(id: number) {
    let title: string = 'Eliminar categoría'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.categoryService.getCategory(id).subscribe((respuesta) => {
      this.categoria = respuesta.data[0]
    })

    this.dialogService.openDialog(this.modalEliminar, title, btnClass, btnCancel).then(confirm => {
      if(confirm) {
        this.categoryService.deleteCategory(id).subscribe({
          next: (respuesta) => {
            this.snackbar.open('Categoría eliminada.', 'Aceptar', {
              duration: 3000
            })
          },
          error: (error) => {
            console.error(error)
          }
        })
      }
    })
  }

  deleteSeleccionCategorias() {
    let title: string = 'Eliminar categorías'; // Título del modal
    let btnClass = 'eliminar'; // Clase para el botón de aceptar
    let btnCancel = 'cancelar';

    this.dialogService.openDialog(this.modalEliminarSeleccion, title, btnClass, btnCancel).then(confirm => {
      if(confirm) {
        this.categoryService.deleteCategories(this.selectedIds).subscribe({
          next: (respuesta) => {
            this.snackbar.open('Categorías eliminadas.', 'Aceptar', {
              duration: 3000
            })
            this.datatableService._observable$.next() // Emitimos observable para reiniciar las ids
          },
          error: (error) => {
            console.error(error)
          }
        })
      }
    })
  }

  // Método que se ejecuta cuando cambia la selección en el hijo para los checkbox
  onSelectionChange(ids: number[]) {
    this.selectedIds = ids;
  }

}
