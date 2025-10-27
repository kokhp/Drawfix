import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrderingItemcardComponent } from './manage-ordering-itemcard.component';

describe('ManageOrderingItemcardComponent', () => {
  let component: ManageOrderingItemcardComponent;
  let fixture: ComponentFixture<ManageOrderingItemcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageOrderingItemcardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageOrderingItemcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
