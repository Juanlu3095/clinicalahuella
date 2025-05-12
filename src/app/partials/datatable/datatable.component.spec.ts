import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatableComponent } from './datatable.component';
import { By } from '@angular/platform-browser';
import { appConfig } from '../../app.config';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatCellHarness } from '@angular/material/table/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { SimpleChange } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableButton } from '../../interfaces/tablebutton';

describe('DatatableComponent', () => {
  let component: DatatableComponent<any>;
  let fixture: ComponentFixture<DatatableComponent<any>>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatatableComponent, MatCheckboxModule],
      providers: [...appConfig.providers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  const mockData = {
    "message": "Newsletters encontradas.",
    "data": [
      {
        "id": "67EB08A815F111F084AFD8BBC1B70204",
        "email": "easyshop.notifications@gmail.com",
        "created_at": "2025-04-10T09:51:42.000Z"
      },
      {
        "id": "09C4B8D7293311F08316D8BBC1B70204",
        "email": "jdominguez@gmail.com",
        "created_at": "2025-05-04T21:59:23.000Z"
      }
    ]
  }

  const mockDataMasDatos = {
    "message": "Newsletters encontradas.",
    "data": [
      {
        "id": "67EB08A815F111F084AFD8BBC1B70204",
        "email": "easyshop.notifications@gmail.com",
        "created_at": "2025-04-10T09:51:42.000Z"
      },
      {
        "id": "09C4B8D7293311F08316D8BBC1B70204",
        "email": "jdominguez@gmail.com",
        "created_at": "2025-05-04T21:59:23.000Z"
      },
      {
        "id": "3334B8D7293311F08316D8BBC1B70204",
        "email": "ldominguez@gmail.com",
        "created_at": "2025-05-04T21:59:23.000Z"
      },
      {
        "id": "4444B8D7293311F08316D8BBC1B70204",
        "email": "jperez@gmail.com",
        "created_at": "2025-05-04T21:59:23.000Z"
      },
      {
        "id": "5554B8D7293311F08316D8BBC1B70204",
        "email": "asuarez@gmail.com",
        "created_at": "2025-05-04T21:59:23.000Z"
      },
      {
        "id": "6664B8D7293311F08316D8BBC1B70204",
        "email": "pepe@gmail.com",
        "created_at": "2025-05-04T21:59:23.000Z"
      },
    ]
  }

  const mockMethods = {
    
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select all checkbox by checking th checkbox', async () => {
    const emitSelectedIdsSpy = spyOn(component, 'emitSelectedIds')
    emitSelectedIdsSpy.and.returnValue()
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns] // Columnas a mostrar en el HTML

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    const checkbox = await loader.getHarness(MatCheckboxHarness.with({selector: '.allToogle'}));
    await checkbox.check();
    
    expect(checkbox).toBeTruthy()
    expect(await checkbox.isChecked()).toBeTrue()
    expect(component.isAllSelected()).toBeTrue() // Comprobamos que todos los checkbox han sido seleccionados
    expect(component.emitSelectedIds).toHaveBeenCalled()
    // Comprobamos que al clickar en el checkbox para seleccionar todo, los elementos seleccionados sean los del mockData
    expect(component.selection.selected).toEqual(mockData.data)
  });

  it('should select only one element', async () => {
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns] // Columnas a mostrar en el HTML

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    const checkbox = await loader.getAllHarnesses(MatCheckboxHarness.with({ selector: '.selectBox'}));
    await checkbox[0].check();
    expect(component.isAllSelected()).toBeFalse()
    expect(component.selection.selected).toHaveSize(1)
    // Confirmamos que el objeto seleccionado sea el primer data de mockData
    expect(component.selection.selected.find(data => data.email === 'easyshop.notifications@gmail.com')).toBeTruthy()
  })

  it('should HTML all data in table', async () => {
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns, 'acciones'] // Columnas a mostrar en el HTML

    let botones: TableButton[] = [
      {id: 1, nombre: 'Editar', class: 'editar', accion: ''},
      {id: 2, nombre: 'Eliminar', class: 'danger', accion: ''},
    ]
    component.buttons = botones

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    const rows = await loader.getAllHarnesses(MatCellHarness.with({ selector: '.cell-data'}))
    const btnEdit = await loader.getAllHarnesses(MatButtonHarness.with({ selector: '.editar' }))
    const btnEliminar = await loader.getAllHarnesses(MatButtonHarness.with({ selector: '.danger' }))
    expect(rows.length).withContext('Celdas de datos en datatable').toBe(6); // id, email y created_at para 2 filas de datos = 6 celdas
    expect(btnEdit.length).withContext('Botones de editar en "acciones" en datatable').toBe(2); // Botones para editar en la tabla
    expect(btnEliminar.length).withContext('Botones de eliminar en "acciones" en datatable').toBe(2); // Botones para eliminar en la tabla
  })

  it('should work paginator', async () => {
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns] // Columnas a mostrar en el HTML

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    const paginator = await loader.getHarness(MatPaginatorHarness)
    expect(await paginator.getPageSize()).toEqual(5) // Es el número máximo de registros por página por defecto
    expect(await paginator.isNextPageDisabled()).toBeTrue() // No hay página siguiente porque hay sólo 2 registros
    
    component.data = mockDataMasDatos.data // Ponemos más datos, al menos 6 para ver la paginación
    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    expect(await paginator.isNextPageDisabled()).toBeFalse() // Hay siguiente página
    expect(await paginator.isPreviousPageDisabled()).toBeTrue() // No hay página anterior
    await paginator.goToNextPage() // Vamos a la siguiente página
    expect(await paginator.isNextPageDisabled()).toBeTrue() // No hay siguiente página
    expect(await paginator.isPreviousPageDisabled()).toBeFalse() // Hay página anterior
  })

  it('should work filter', async () => {
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns, 'acciones'] // Columnas a mostrar en el HTML

    let botones: TableButton[] = [
      {id: 1, nombre: 'Editar', class: 'editar', accion: ''},
      {id: 2, nombre: 'Eliminar', class: 'danger', accion: ''},
    ]
    component.buttons = botones

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    const input = await loader.getHarness(MatInputHarness) // Sólo hay 1 matInput
    await input.setValue('easyshop')
    fixture.detectChanges()
    expect(component.dataSource.filter).toBe('easyshop') // Sabemos que ha cogido el filtro correctamente
    expect(component.dataSource.filteredData).toHaveSize(1)
    expect(component.dataSource.filteredData).toEqual([{ // Comprobamos que el dato filtrado sea el de easyshop
        "id": "67EB08A815F111F084AFD8BBC1B70204",
        "email": "easyshop.notifications@gmail.com",
        "created_at": "2025-04-10T09:51:42.000Z"
    }])
  })

  it('should work sort to put a row before others', async () => {
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns, 'acciones'] // Columnas a mostrar en el HTML

    let botones: TableButton[] = [
      {id: 1, nombre: 'Editar', class: 'editar', accion: ''},
      {id: 2, nombre: 'Eliminar', class: 'danger', accion: ''},
    ]
    component.buttons = botones

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })
    fixture.detectChanges()

    const matSortHeader = await loader.getHarness(MatSortHeaderHarness.with({ label: 'Email' })) // El label es <th>{{ column | titlecase }}</th>

    expect(await matSortHeader.getSortDirection()).withContext('Orden para primer click').toBe('') // Al principio no hay orden

    await matSortHeader.click()
    // Se debe usar una copia de component.dataSource.filteredData porque al usar 'component.dataSource.sortData', sortData aplica los cambios directamente a filteredData
    // y no genera una instancia o un objeto diferente. Por eso en el segundo click siguen saliendo iguales, porque se modifica filteredData en todo el test
    const dataSortedAsc = component.dataSource.sortData([...component.dataSource.filteredData], component.dataSource.sort!) // Obtenemos los datos ordenados
    expect(component.dataSource.filteredData).withContext('Primer click').toEqual(dataSortedAsc) // El orden 'asc' es igual que el inicial por casualidad
    expect(await matSortHeader.getSortDirection()).withContext('Orden para primer click').toBe('asc') // Primer click: orden ascendente

    await matSortHeader.click()
    const dataSortedDesc = component.dataSource.sortData([...component.dataSource.filteredData], component.dataSource.sort!) // Obtenemos los datos ordenados
    expect(dataSortedAsc).withContext('Segundo click').not.toEqual(dataSortedDesc) // El orden ahora es distinto con respecto al primer click 'asc'
    expect(await matSortHeader.getSortDirection()).withContext('Orden para primer click').toBe('desc') // Segundo click: orden descendente
  })

  it('should do something when clicking eliminarSeleccionados button', async () => {
    // Comprobar si el botón está en el HTML por btnDangerAll
    // Comprobar si se llama la funcion al presionar el botón
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns, 'acciones'] // Columnas a mostrar en el HTML

    const eliminarSeleccionadosF = () => {
      component.data = []
    }
    component.eliminarSeleccionados = eliminarSeleccionadosF;

    let botones: TableButton[] = [
      {id: 1, nombre: 'Editar', class: 'editar', accion: ''},
      {id: 2, nombre: 'Eliminar', class: 'danger', accion: ''},
    ]
    component.buttons = botones

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })

    fixture.detectChanges()
    
    component.btnDangerAll = true // El botón no está en el HTML
    fixture.detectChanges(); // Detectamos que se ha cambiado el valor de btnDangerAll
    let btnDeleteAll = fixture.debugElement.query(By.css('.dangerAll'));
    expect(btnDeleteAll).withContext('btnDangerAll es true').not.toBeTruthy()

    component.btnDangerAll = false // El botón está en el HTML
    fixture.detectChanges(); // Detectamos que se ha cambiado de nuevo el valor de btnDangerAll
    btnDeleteAll = fixture.debugElement.query(By.css('.dangerAll'));
    expect(btnDeleteAll).withContext('btnDangerAll es false').toBeTruthy()

    // Si usáramos una const o var con el botón no se ejecutaría porque cambiamos el valor de btnDangerAll
    btnDeleteAll.triggerEventHandler('click') // Pulsamos el botón para eliminar la selección
    fixture.detectChanges()
    expect(component.data.length).toBe(0) // Se debeb de haber borrado todos los datos de component.data al pulsar btnDeleteAll
  })

  it('should do something when clicking buttons in datatable', async () => {
    // Comprobar que se ejecuta la accion al pulsar TableButton
    component.data = mockData.data
    component.columns = ['id', 'email', 'created_at'] // Columnas para ponerlas en displayedColumns
    component.displayedColumns = ['select', ...component.columns, 'acciones'] // Columnas a mostrar en el HTML

    const editarSpy = jasmine.createSpy('editar') // Creamos spy que inyectamos en la 'accion' de los botones para comprobar que se llamen al hacer click
    const eliminarSpy = jasmine.createSpy('eliminar')

    let botones: TableButton[] = [
      {id: 1, nombre: 'Editar', class: 'editar', accion: editarSpy},
      {id: 2, nombre: 'Eliminar', class: 'danger', accion: eliminarSpy},
    ]
    component.buttons = botones

    component.ngOnChanges({
      data: new SimpleChange(null, component.data, true)
    })

    fixture.detectChanges()

    const btnEditarEasyshop = await loader.getHarness(MatButtonHarness.with({ selector: '.editar67EB08A815F111F084AFD8BBC1B70204'}))
    const btnEliminarEasyshop = await loader.getHarness(MatButtonHarness.with({ selector: '.danger67EB08A815F111F084AFD8BBC1B70204'}))

    await btnEditarEasyshop.click()
    expect(editarSpy).toHaveBeenCalled()

    await btnEliminarEasyshop.click()
    expect(eliminarSpy).toHaveBeenCalled()
  })
});
