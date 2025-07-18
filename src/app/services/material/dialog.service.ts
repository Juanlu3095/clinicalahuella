import { Injectable, TemplateRef } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../partials/dialog/dialog.component';
import { firstValueFrom } from 'rxjs';
import { SpinnerComponent } from '../../partials/spinner/spinner.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog) { }

  // Le pasamos como parámetro la referencia del componente a abrir como modal(html)
  openDialog({ html, title, btnClass, btnCancel, position, hasBackdrop, panelClass} : 
              {html: TemplateRef<HTMLElement>, title?: string, btnClass?: string, btnCancel?: string, position?: DialogPosition, hasBackdrop?: boolean, panelClass?: string} ) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {html: html, title: title, btnClass: btnClass, btnCancel: btnCancel },
      //width: '40vw',
      minWidth: '50vw',
      position, // { right: '5rem', bottom: '5rem'}, Posición del dialog
      hasBackdrop: hasBackdrop ?? true, // Permite quitar el sombreado de fuera del dialog
      panelClass // Clase que le damos al overlay del dialog. Debe ir en styles.scss, el global, para que funcione,
    });

    return firstValueFrom(dialogRef.afterClosed()); // Convertimos el observable en una promesa, el cual se ejecuta al cerrar el modal
  }

  // Muestra la ventana con el spinner cargando
  openSpinner() {
    this.dialog.open(SpinnerComponent, { disableClose: true }) // true hace que no se pueda cerrar el dialog pulsando fuera del mismo
  }

  // Cerrar dialogs
  closeAll() {
    this.dialog.closeAll();
  }

}