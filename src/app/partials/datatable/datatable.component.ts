import {Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, OnInit, OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import {SelectionModel} from '@angular/cdk/collections';
import { TableButton } from '../../interfaces/tablebutton';
import { environment } from '../../../environments/environment.development';
import { DatatableService } from '../../services/material/datatable.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-datatable',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule, CommonModule],
  templateUrl: './datatable.component.html',
  styleUrl: './datatable.component.scss'
})
export class DatatableComponent<T> implements OnChanges, OnInit, OnDestroy {

  selection = new SelectionModel<any>(true, undefined);
  suscripcion: Subscription = new Subscription();

  // Inputs -> Datos del padre al hijo (Dashboardmensajes => TablaCompleta)
  @Input() columnImage: string[] = []; // columna para las imagenes
  @Input() columns: string[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() data: T[] = [];
  @Input() buttons: TableButton[] = [];
  @Input() eliminarSeleccionados: () => void = new Input;
  @Input() btnDangerAll: boolean = false; // Permite mostrar o no si se muestra el botón de eliminar todo

  // Output -> Datos del hijo al padre (Datatable => Componente que tenga la tabla)
  @Output() selectionChange = new EventEmitter<any>(); // Con esto mandamos al padre los ids seleccionados para los checkbox
  // Lo que se emite en el evento pueden ser string o number (ids normales o HEX)
  dataSource = new MatTableDataSource<T>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator = {} as MatPaginator; // Hace referencia a mat-paginator en el HTML. Añadimos {static:true} para cambiar el label de registros por página.
  @ViewChild(MatSort) sort!: MatSort; // Hace referencia a mat-sort en el HTML
  @ViewChild('btnDangerAll', { static: false }) botonEliminarTodo: ElementRef = {} as ElementRef;
  @ViewChild('checkBox', {static: true}) checkbox: ElementRef = {} as ElementRef

  storageEndpoint = environment.FilesEndpoint;

  constructor(private datatableService: DatatableService) {}

  // Actualizamos los datos en el HTML
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {
    this.paginator._intl.itemsPerPageLabel = "Registros por página:"; // Cambiamos el label 'Items per page'
    this.paginator._intl.previousPageLabel = "Anterior";
    this.paginator._intl.nextPageLabel = "Siguiente";

    // Nos permite suscribirnos al observable de este servicio para que al confirmar la eliminación de una selección, se reinicien
    // los ids seleccionados.
    this.suscripcion = this.datatableService._observable$.subscribe(() => {
      this.resetSelectedIds()
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe()
  }

  // Función para aplicar el filtro
  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value; // Contiene la palabra del input del filtro
    this.dataSource.filter = filterValue.trim().toLowerCase(); // Al igualar a dataSource.filter, automáticamente se filtra en dataSource por el valor dado

    // Nos lleva automáticamente a la primera página del listado, se ejecuta sólo cuando se activa el filtro (p.ej. escribiendo algo en el filtro.)
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Método para emitir los IDs seleccionados al padre con el Output
  emitSelectedIds() {
    const selectedIds = this.selection.selected.map(mensaje => mensaje['id']);
    console.log('Emitting selected IDs:', selectedIds);
    this.selectionChange.emit(selectedIds);  // Emitimos los IDs seleccionados
  }

  // Método para reiniciar las ids seleccionadas. Se usa cuando ya se haya hecho algún borrado.
  resetSelectedIds() {
    this.selection.clear()
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
