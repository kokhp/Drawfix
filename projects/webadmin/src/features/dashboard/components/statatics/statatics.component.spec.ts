import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StataticsComponent } from './statatics.component';

describe('StataticsComponent', () => {
  let component: StataticsComponent;
  let fixture: ComponentFixture<StataticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StataticsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StataticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
