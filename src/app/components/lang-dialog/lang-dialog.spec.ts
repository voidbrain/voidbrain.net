import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangDialog } from './lang-dialog';

describe('LangDialog', () => {
  let component: LangDialog;
  let fixture: ComponentFixture<LangDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(LangDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
