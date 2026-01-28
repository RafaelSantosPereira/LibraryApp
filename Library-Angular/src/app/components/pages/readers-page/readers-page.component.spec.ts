import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadersPageComponent } from './readers-page.component';

describe('ReadersPageComponent', () => {
  let component: ReadersPageComponent;
  let fixture: ComponentFixture<ReadersPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadersPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
