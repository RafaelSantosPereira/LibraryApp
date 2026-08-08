import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanActionDialogComponent } from './loan-action-dialog.component';

describe('LoanActionDialogComponent', () => {
  let component: LoanActionDialogComponent;
  let fixture: ComponentFixture<LoanActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanActionDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoanActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
