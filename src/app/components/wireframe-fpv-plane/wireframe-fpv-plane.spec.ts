import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WireframeFpvPlane } from './wireframe-fpv-plane';

describe('WireframeFpvPlane', () => {
  let component: WireframeFpvPlane;
  let fixture: ComponentFixture<WireframeFpvPlane>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WireframeFpvPlane]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WireframeFpvPlane);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
