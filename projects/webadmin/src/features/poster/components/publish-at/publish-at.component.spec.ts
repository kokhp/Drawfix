import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishAtComponent } from './publish-at.component';

describe('PublishAtComponent', () => {
  let component: PublishAtComponent;
  let fixture: ComponentFixture<PublishAtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishAtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishAtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
