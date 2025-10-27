import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticalToggleComponent } from './political-toggle.component';

describe('PoliticalToggleComponent', () => {
  let component: PoliticalToggleComponent;
  let fixture: ComponentFixture<PoliticalToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticalToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticalToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
