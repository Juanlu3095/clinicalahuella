import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { Category, CategoryPartial } from '../../interfaces/category';
import { switchMap } from 'rxjs';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(withFetch())],
    });
    service = TestBed.inject(CategoryService);
  });

  it('should get categories', (done: DoneFn) => {
    service.getCategories().subscribe(respuesta => {
      expect(respuesta.data).toHaveSize(4);
      done();
    })
    
  });

  it('should get category "Cuidado animal"', (done: DoneFn) => {
    let expectedCategory: CategoryPartial = {
      id: 3,
      nombre: 'Cuidado animal',
      created_at: '2025-04-20T17:26:01.000Z',
      updated_at: '2025-04-20T17:26:01.000Z'
    }

    service.getCategory(3).subscribe(respuesta => { // El subscribe es asíncrono y se ejecuta antes el expect
      expect(respuesta.data).toContain(expectedCategory);
      done();
    })

  })

  it('should post category', (done: DoneFn) => {
    let newCategory: CategoryPartial = {
      nombre: 'Cuidados'
    }

    service.postCategory(newCategory).pipe(
      switchMap(() => service.getCategories())
    ).subscribe(respuesta => {
      expect(respuesta.data).toHaveSize(5)
      done()
    })
    
  })

  it('should update category', (done: DoneFn) => {
    let id: number

    let updatedCategory: CategoryPartial = {
      nombre: 'Cuidados avanzados'
    }

    service.getCategories().subscribe(respuesta => {
      id = respuesta.data[4].id
      service.updateCategory(respuesta.data[4].id, updatedCategory).pipe(
        switchMap(() => service.getCategory(id))
      ).subscribe(finalResponse => {
        expect(finalResponse.data[0].nombre).toBe(updatedCategory.nombre)
        done()
      })
    })
  })

  it('should delete category', (done: DoneFn) => {
    // Se debe usar get Categories para obtener el id de la categoria creada con el post de antes usando respuesta.data[4]
    // al suponer que hay 5 categorías en total, y luego pasárselo al delete para que borre esa categoría y esperar 4.
    service.getCategories().subscribe(respuesta => {
      service.deleteCategory(respuesta.data[4].id).pipe(
        switchMap(() => service.getCategories())
      ).subscribe(finalResponse => {
        expect(finalResponse.data).toHaveSize(4)
        done()
      })
    })
  })
  
});
