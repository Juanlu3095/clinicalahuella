import { TestBed } from '@angular/core/testing';

import { DialogService } from './dialog.service';
import { TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

describe('DialogService', () => {
  let service: DialogService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MatDialog', ['closeAll']); // Crea objeto falso de matdialog y la funcion closeAll

    TestBed.configureTestingModule({
      imports: [],
      providers: [{ provide: MatDialog, useValue: spy }] 
      // Cada vez que se inyecte MatDialog, le devuelve spy, y se usa éste para cuando sólo tenemos un método. En este caso usamos otro spy distinto para el otro método
    });

    service = TestBed.inject(DialogService);
    dialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>; // Inyectamos el MatDialog falso, el spy que ponemos en providers y con el 'as' le indicamos el tipo
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a value when confirm', async () => {
    const mockConfirmar = new Promise(function(resolve, reject) {
      resolve('confirm')
    })

    const openDialogSpy = spyOn(service, 'openDialog')
    openDialogSpy.and.returnValue(mockConfirmar)

    const dialog = {} as TemplateRef<HTMLElement>

    await service.openDialog(dialog, 'Prueba', 'ok', 'cancelar').then(respuesta => { // También se puede usar doneFn
      expect(respuesta).toBeTruthy()
      expect(respuesta).toEqual('confirm')
    })
  })

  // Se comprueba que se haya llamado a la dependencia del servicio en el constructor: public dialog: MatDialog
  it('should work closeAll dialogs', () => {
    service.closeAll()
    expect(dialogSpy.closeAll).toHaveBeenCalled() // Comprobamos que se llame al método del spy
  })
});
