import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCardComponent } from './loan-card.component';

describe('LoanCardComponent', () => {
  let component: LoanCardComponent;
  let fixture: ComponentFixture<LoanCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
