import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../partials/dialog/dialog.component';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(public dialog: MatDialog) { }

  openDialog(html: TemplateRef<HTMLElement>, title?: string, btnClass?: string, btnCancel?: string) { // Le pasamos como parámetro la referencia del componente a abrir como modal(html)
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {html: html, title: title, btnClass: btnClass, btnCancel: btnCancel },
      width: '40vw',
    });

    return firstValueFrom(dialogRef.afterClosed()); // Convertimos el observable en una promesa, el cual se ejecuta al cerrar el modal
  }

  // Cerrar dialogs
  closeAll() {
    this.dialog.closeAll();
  }

}