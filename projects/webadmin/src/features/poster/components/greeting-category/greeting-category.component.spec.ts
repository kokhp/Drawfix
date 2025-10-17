import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreetingCategoryComponent } from './greeting-category.component';

describe('GreetingCategoryComponent', () => {
  let component: GreetingCategoryComponent;
  let fixture: ComponentFixture<GreetingCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GreetingCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GreetingCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
