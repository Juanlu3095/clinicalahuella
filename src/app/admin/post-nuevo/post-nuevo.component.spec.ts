import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostNuevoComponent } from './post-nuevo.component';

describe('PostNuevoComponent', () => {
  let component: PostNuevoComponent;
  let fixture: ComponentFixture<PostNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostNuevoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
