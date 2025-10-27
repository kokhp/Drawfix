import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCategoryStatusComponent } from './update-category-status.component';

describe('UpdateCategoryStatusComponent', () => {
  let component: UpdateCategoryStatusComponent;
  let fixture: ComponentFixture<UpdateCategoryStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateCategoryStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateCategoryStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
