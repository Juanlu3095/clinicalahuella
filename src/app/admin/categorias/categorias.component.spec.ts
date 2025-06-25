import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { CategoriasComponent } from './categorias.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { By } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DatatableComponent } from '../../partials/datatable/datatable.component';
import { CategoryService } from '../../services/api/category.service';
import { of } from 'rxjs';

describe('CategoriasComponent', () => {
  let service: CategoryService;
  let component: CategoriasComponent;
  let fixture: ComponentFixture<CategoriasComponent>; // Contexto, engloba html, css...
  let overlayContainer: OverlayContainer; // servicio de angular material para renderizar elementos como matDialog del overlay
  let overlayContainerElement: HTMLElement; // el HTML donde están los elementos del overlay

  // overlayContainer es el servicio que nos permite crear los elementos de Angular Material
  // Los elementos de material están en el contenedor del overlay, overlayContainerElement, es el DOM

  beforeEach(async () => {
    await TestBed.configureTestingModule({ // Configuración del módulo para los tests
      imports: [CategoriasComponent, ReactiveFormsModule],
      providers: [provideHttpClient(withFetch()), provideAnimationsAsync(), {provide: CategoryService}],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriasComponent); // Creamos un objeto a partir del componente
    component = fixture.componentInstance; // Recuperamos la clase del componente
    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();
    service = TestBed.inject(CategoryService);
    fixture.detectChanges(); // Permite que se ejecute todo lo del componente
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title.getTitle()).toBe('Categorías < Clínica veterinaria La Huella')
  })

  it('should have h1: Categorias', () => {
    const cardElement: HTMLElement = fixture.nativeElement
    expect(cardElement.textContent).toContain('Categorías')
  })

  it('it should get categories at the start', (done: DoneFn) => {
    fixture.detectChanges()
    setTimeout(() => {
      expect(component.categorias.length).toBeGreaterThan(0);
      done();
    }, 1000); // Damos un tiempo para que carguen las categorias
  })

  it('should create category', waitForAsync(() => { //waitForAsync para esperar a que se completen las funciones asíncronas, whenStable
    component.crearCategoriaForm.patchValue({
      nombre: 'Animales de compañía'
    })
    
    const buttonSubmit = fixture.debugElement.query(By.css('button.nuevo'));
    buttonSubmit.triggerEventHandler('click')

    fixture.whenStable() // Se usa whenStable en lugar de fixture.detectChanges() ya que es posible que haya cargado todo
      .then(() => { // some devuelve true cuando encuentre el elemento indicado
        expect(component.categorias.some(categoria => categoria.nombre === 'Animales de compañía')).toBeTrue()
      })

  }))

  it('should open update category modal', waitForAsync(() => {
    fixture.whenStable() // Esperamos a que todo el componente cargue para que podamos ver 'categorias'
      .then(() => {
        fixture.detectChanges()
        let idCategoria = component.categorias.find(categoria => categoria.nombre === 'Animales de compañía')?.id
        
        const datatable = fixture.debugElement.query(By.directive(DatatableComponent)); // el botón está en datatable
        let btnAbrirModal = datatable.query(By.css(`.editar${idCategoria}`))
        console.log(btnAbrirModal)
        expect(btnAbrirModal).withContext('Botón para abrir modal editar').toBeTruthy()
        btnAbrirModal.triggerEventHandler('click')

        fixture.whenStable() // Hay que poner esto ya que al hacer click en el botón se ejecuta el openDialog que devuelve una promesa
          .then(() => {
            fixture.detectChanges() // No espera promesas, solo actualiza el DOM con datos actuales
            let editarModal = overlayContainerElement.querySelector('.modalEditar')
            
            expect(editarModal).withContext('abrirModal').toBeTruthy() // Se ve como se abre el dialog pero lo detecta el test

          })
    })
  }))

  it('should update category', waitForAsync(() => {
    fixture.whenStable()
      .then(() => {
        fixture.detectChanges()
        component.editarCategoriaForm.patchValue({
          nombre_editar: 'Animales'
        })

        let idCategoria = component.categorias.find(categoria => categoria.nombre === 'Animales de compañía')?.id
        console.log(idCategoria)
        expect(idCategoria).withContext('Comprobar id categoría').toBeTruthy()
        
        if(idCategoria) {
          component.editarCategoria(idCategoria)
          // Emitir el observable refresh de categoryService
          service.refresh$.next()

          fixture.whenStable()
          .then((done: DoneFn) => {
            fixture.detectChanges()
            
            setTimeout(() => {
              let updatedCategoria = component.categorias.find(categoria => categoria.id === idCategoria)?.nombre
              console.log('Esta es la categoria actualizada: ', updatedCategoria)
              expect(updatedCategoria).withContext('Comprobar si existe la categoría actualizada').toBeTruthy()
              expect(updatedCategoria).withContext('Comprobar si se ha actualizado la categoría').toBe('Animales')
              done();
            }, 1000);
          
          })
        }  
      })
  }))

  it('should open delete category modal', () => {
    fixture.whenStable() // Esperamos a que todo el componente cargue para que podamos ver 'categorias'
    .then(() => {
      fixture.detectChanges()
      // Obtenemos la id de la categoría 'Animales'
      let idCategoria = component.categorias.find(categoria => categoria.nombre === 'Animales')?.id
      
      const datatable = fixture.debugElement.query(By.directive(DatatableComponent)); // el botón está en datatable
      let btnAbrirModal = datatable.query(By.css(`.danger${idCategoria}`))
      console.log(btnAbrirModal)
      expect(btnAbrirModal).withContext('Botón para abrir modal eliminar').toBeTruthy()
      btnAbrirModal.triggerEventHandler('click')

      fixture.whenStable() // Hay que poner esto ya que al hacer click en el botón se ejecuta el openDialog que devuelve una promesa
        .then(() => {
          fixture.detectChanges() // No espera promesas, solo actualiza el DOM con datos actuales
          let eliminarModal = overlayContainerElement.querySelector('.modalEliminar')
          
          expect(eliminarModal).withContext('abrirModalEliminar').toBeTruthy() // Se ve como se abre el dialog pero lo detecta el test

        })
    })
  })

  it('should delete category "Animales"', waitForAsync((done: DoneFn) => {
    let idCategoria = component.categorias.find(categoria => categoria.nombre === 'Animales')?.id
    if(idCategoria) {
      component.deleteCategoria(idCategoria)
      fixture.detectChanges()

      expect(idCategoria).toBeFalsy()
      done()
    }
  }))

  it('should open delete selection category modal', () => {

  })

  it('should open delete selected categories', () => {

  })
});
