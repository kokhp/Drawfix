import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrderingComponent } from './manage-ordering.component';

describe('ManageOrderingComponent', () => {
  let component: ManageOrderingComponent;
  let fixture: ComponentFixture<ManageOrderingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageOrderingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
