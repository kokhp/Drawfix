import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticalTemplateComponent } from './political-template.component';

describe('PoliticalTemplateComponent', () => {
  let component: PoliticalTemplateComponent;
  let fixture: ComponentFixture<PoliticalTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticalTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticalTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
