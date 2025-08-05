import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [...appConfig.providers]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'lahuella' title`, () => {
    expect(component.title).toEqual('lahuella');
  });

  it('should open banner with no consentimiento_ga in localStorage', () => {
    localStorage.removeItem('consentimiento_ga')
    const spyBanner = spyOn(component, 'openCookieBanner')
    component.ngOnInit()
    expect(spyBanner).toHaveBeenCalled()
    expect(component.consentimiento).toBeNull()
  })

  it('should not open banner since consentimiento_ga exists.', () => {
    localStorage.setItem('consentimiento_ga', 'false')
    const spyBanner = spyOn(component, 'openCookieBanner')
    component.ngOnInit()
    expect(spyBanner).not.toHaveBeenCalled()
    expect(component.consentimiento).toBe('false')
  })
});
