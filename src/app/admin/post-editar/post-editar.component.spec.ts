import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditarComponent } from './post-editar.component';

describe('PostEditarComponent', () => {
  let component: PostEditarComponent;
  let fixture: ComponentFixture<PostEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
