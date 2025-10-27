import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateCatogoryComponent } from './template-catogory.component';

describe('TemplateCatogoryComponent', () => {
  let component: TemplateCatogoryComponent;
  let fixture: ComponentFixture<TemplateCatogoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateCatogoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateCatogoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
