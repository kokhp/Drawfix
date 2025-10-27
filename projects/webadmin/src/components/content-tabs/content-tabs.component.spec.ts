import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentTabsComponent } from './content-tabs.component';

describe('ContentTabsComponent', () => {
  let component: ContentTabsComponent;
  let fixture: ComponentFixture<ContentTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
