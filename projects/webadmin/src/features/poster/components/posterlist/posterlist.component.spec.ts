import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterlistComponent } from './posterlist.component';

describe('PosterlistComponent', () => {
  let component: PosterlistComponent;
  let fixture: ComponentFixture<PosterlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosterlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
