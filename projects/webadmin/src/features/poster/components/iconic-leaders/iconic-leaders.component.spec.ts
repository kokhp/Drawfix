import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconicLeadersComponent } from './iconic-leaders.component';

describe('IconicLeadersComponent', () => {
  let component: IconicLeadersComponent;
  let fixture: ComponentFixture<IconicLeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconicLeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconicLeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
