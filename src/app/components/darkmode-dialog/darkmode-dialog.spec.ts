import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkmodeDialog } from './darkmode-dialog';

describe('DarkmodeDialog', () => {
  let component: DarkmodeDialog;
  let fixture: ComponentFixture<DarkmodeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkmodeDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(DarkmodeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
