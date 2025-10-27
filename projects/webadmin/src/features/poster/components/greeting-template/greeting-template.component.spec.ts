import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreetingTemplateComponent } from './greeting-template.component';

describe('GreetingTemplateComponent', () => {
  let component: GreetingTemplateComponent;
  let fixture: ComponentFixture<GreetingTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreetingTemplateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreetingTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
