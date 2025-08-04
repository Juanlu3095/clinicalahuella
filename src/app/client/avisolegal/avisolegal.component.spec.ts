import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvisolegalComponent } from './avisolegal.component';

describe('AvisolegalComponent', () => {
  let component: AvisolegalComponent;
  let fixture: ComponentFixture<AvisolegalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvisolegalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvisolegalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
