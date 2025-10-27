import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterlistItemcardComponent } from './posterlist-itemcard.component';

describe('PosterlistItemcardComponent', () => {
  let component: PosterlistItemcardComponent;
  let fixture: ComponentFixture<PosterlistItemcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosterlistItemcardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosterlistItemcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
