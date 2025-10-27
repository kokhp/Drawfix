import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainTopnavComponent } from './main-topnav.component';

describe('MainTopnavComponent', () => {
  let component: MainTopnavComponent;
  let fixture: ComponentFixture<MainTopnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainTopnavComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainTopnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
