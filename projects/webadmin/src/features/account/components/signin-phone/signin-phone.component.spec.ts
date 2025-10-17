import { ComponentFixture, TestBed } from '@angular/core/testing';

import SigninPhoneComponent from './signin-phone.component';

describe('SigninPhoneComponent', () => {
  let component: SigninPhoneComponent;
  let fixture: ComponentFixture<SigninPhoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninPhoneComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SigninPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
