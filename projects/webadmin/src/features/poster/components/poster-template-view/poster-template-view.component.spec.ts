import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosterTemplateViewComponent } from './poster-template-view.component';

describe('PosterTemplateViewComponent', () => {
  let component: PosterTemplateViewComponent;
  let fixture: ComponentFixture<PosterTemplateViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosterTemplateViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosterTemplateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
