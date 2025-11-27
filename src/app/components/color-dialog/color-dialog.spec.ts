import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorDialog } from './color-dialog';

describe('ColorDialog', () => {
  let component: ColorDialog;
  let fixture: ComponentFixture<ColorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
