import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NextIdProfileComponent } from './next-id-profile.component';

describe('NextIdProfileComponent', () => {
  let component: NextIdProfileComponent;
  let fixture: ComponentFixture<NextIdProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NextIdProfileComponent]
    });
    fixture = TestBed.createComponent(NextIdProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
