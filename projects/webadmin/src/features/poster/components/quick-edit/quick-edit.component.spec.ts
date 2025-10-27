import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickEditComponent } from './quick-edit.component';

describe('QuickEditComponent', () => {
  let component: QuickEditComponent;
  let fixture: ComponentFixture<QuickEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
