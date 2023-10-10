import { ComponentFixture, TestBed } from '@angular/core/testing';

import { W3mButtonComponent } from './w3m-button.component';

describe('W3mButtonComponent', () => {
  let component: W3mButtonComponent;
  let fixture: ComponentFixture<W3mButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [W3mButtonComponent]
    });
    fixture = TestBed.createComponent(W3mButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
