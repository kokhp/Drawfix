import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiryAtComponent } from './expiry-at.component';

describe('ExpiryAtComponent', () => {
  let component: ExpiryAtComponent;
  let fixture: ComponentFixture<ExpiryAtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiryAtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiryAtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
