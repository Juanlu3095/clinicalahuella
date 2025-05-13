import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogComponent } from './dialog.component';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { appConfig } from '../../app.config';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent],
      providers: [...appConfig.providers,
        {provide: MatDialogRef, useValue: MatDialogRef<DialogComponent>},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call confirmar when clicking HTML button', async () => {
    component.data.btnClass = "confirmar"
    const confirmarSpy = spyOn(component, 'confirmar')
    const btnConfirmar = await loader.getHarness(MatButtonHarness.with({ selector: '.confirmar'}))

    expect(btnConfirmar).toBeTruthy()

    await btnConfirmar.click()
    expect(confirmarSpy).toHaveBeenCalled()

  })
});
