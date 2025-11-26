import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WireframeSphere } from './wireframe-sphere';

describe('WireframeSphere', () => {
  let component: WireframeSphere;
  let fixture: ComponentFixture<WireframeSphere>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WireframeSphere],
    }).compileComponents();

    fixture = TestBed.createComponent(WireframeSphere);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
