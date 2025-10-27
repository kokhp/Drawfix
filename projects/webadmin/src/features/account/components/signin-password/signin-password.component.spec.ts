import { ComponentFixture, TestBed } from '@angular/core/testing';

import SigninPasswordComponent from './signin-password.component';

describe('SigninPasswordComponent', () => {
  let component: SigninPasswordComponent;
  let fixture: ComponentFixture<SigninPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninPasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SigninPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
