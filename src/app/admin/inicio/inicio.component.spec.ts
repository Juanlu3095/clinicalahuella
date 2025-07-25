import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioComponent } from './inicio.component';
import { appConfig } from '../../app.config';
import { AnalyticsService } from '../../services/api/analytics.service';
import { Observable, of, throwError } from 'rxjs';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

const mockAnalyticsService: {
  getPageUrlData: () => Observable<ApiresponsePartial>,
  getCountriesData: () => Observable<ApiresponsePartial>,
  getDevicesData: () => Observable<ApiresponsePartial>,
} = {
  getPageUrlData: () => of({}),
  getCountriesData: () => of({}),
  getDevicesData: () => of({})
}

const mockAnalyticsPageUrl = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "/contacto",
        "value": "44"
      },
      {
        "dimension": "/",
        "value": "20"
      }
    ]
  }

  const mockAnalyticsCountry = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "Spain",
        "value": "323"
      }
    ]
  }

  const mockAnalyticsDevice = {
    "message": "Datos encontrados.",
    "data": [
      {
        "dimension": "desktop",
        "value": "224"
      },
      {
        "dimension": "mobile",
        "value": "99"
      }
    ]
  }

  const mockAnalyticsError = {
    'error': 'Datos no encontrados.'
  }

describe('InicioComponent', () => {
  let component: InicioComponent;
  let fixture: ComponentFixture<InicioComponent>;
  let analyticsService: AnalyticsService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioComponent],
      providers: [
        ...appConfig.providers,
        { provide: AnalyticsService, useValue: mockAnalyticsService }
      ]
    })
    .compileComponents();

    analyticsService = TestBed.inject(AnalyticsService)
    fixture = TestBed.createComponent(InicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.title.getTitle()).toBe('Panel de control < Clínica veterinaria La Huella')
  })

  it('should get Analytics data by page url, getPageUrslData()', () => {
    const spyAnalyticsService = spyOn(analyticsService, 'getPageUrlData')
    spyAnalyticsService.and.returnValue(of(mockAnalyticsPageUrl))

    component.getPageUrslData()

    expect(mockAnalyticsService.getPageUrlData).toHaveBeenCalled()
    expect(component.dataByPageurl).toBe(mockAnalyticsPageUrl.data)
  })

  it('should not get Analytics data by page url because error server 500, getPageUrslData()', () => {
    const spyAnalyticsService = spyOn(analyticsService, 'getPageUrlData')
    spyAnalyticsService.and.returnValue(throwError(() => ({
      status: 500,
      error: 'Datos no encontrados.'
    })))

    component.dataByPageurl = []
    component.getPageUrslData()

    expect(mockAnalyticsService.getPageUrlData).toHaveBeenCalled()
    expect(component.dataByPageurl).toEqual([])
    
    analyticsService.getPageUrlData().subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error.error).toBe(mockAnalyticsError.error)
      }
    })
  })

  it('should get Analytics data by country, getCountriesData()', () => {
    const spyAnalyticsService = spyOn(analyticsService, 'getCountriesData')
    spyAnalyticsService.and.returnValue(of(mockAnalyticsCountry))

    component.getCountriesData()

    expect(mockAnalyticsService.getCountriesData).toHaveBeenCalled()
    expect(component.dataByCountries).toBe(mockAnalyticsCountry.data)
  })

  it('should not get Analytics data by country because error server 500, getCountriesData()', () => {
    const spyAnalyticsService = spyOn(analyticsService, 'getCountriesData')
    spyAnalyticsService.and.returnValue(throwError(() => ({
      status: 500,
      error: 'Datos no encontrados.'
    })))

    component.dataByCountries = []
    component.getCountriesData()

    expect(mockAnalyticsService.getCountriesData).toHaveBeenCalled()
    expect(component.dataByCountries).toEqual([])
    
    analyticsService.getCountriesData().subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error.error).toBe(mockAnalyticsError.error)
      }
    })
  })

  it('should get Analytics data by device, getDevicesData()', () => {
    const spyAnalyticsService = spyOn(analyticsService, 'getDevicesData')
    spyAnalyticsService.and.returnValue(of(mockAnalyticsDevice))

    component.getDevicesData()

    expect(mockAnalyticsService.getDevicesData).toHaveBeenCalled()
    expect(component.dataByDevices).toBe(mockAnalyticsDevice.data)
  })

  it('should not get Analytics data by device because error server 500, getDevicesData()', () => {
    const spyAnalyticsService = spyOn(analyticsService, 'getDevicesData')
    spyAnalyticsService.and.returnValue(throwError(() => ({
      status: 500,
      error: 'Datos no encontrados.'
    })))

    component.dataByDevices = []
    component.getDevicesData()

    expect(mockAnalyticsService.getDevicesData).toHaveBeenCalled()
    expect(component.dataByDevices).toEqual([])
    
    analyticsService.getDevicesData().subscribe({
      next: () => fail(),
      error: (error) => {
        expect(error.error).toBe(mockAnalyticsError.error)
      }
    })
  })
});
