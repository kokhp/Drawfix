import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreetingToggleComponent } from './greeting-toggle.component';

describe('GreetingToggleComponent', () => {
  let component: GreetingToggleComponent;
  let fixture: ComponentFixture<GreetingToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreetingToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreetingToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
