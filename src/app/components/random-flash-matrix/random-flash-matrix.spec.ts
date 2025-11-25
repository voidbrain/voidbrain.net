import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomFlashMatrix } from './random-flash-matrix';

describe('RandomFlashMatrix', () => {
  let component: RandomFlashMatrix;
  let fixture: ComponentFixture<RandomFlashMatrix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomFlashMatrix]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandomFlashMatrix);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
