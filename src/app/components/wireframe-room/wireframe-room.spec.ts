import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WireframeRoom } from './wireframe-room';

describe('WireframeRoom', () => {
  let component: WireframeRoom;
  let fixture: ComponentFixture<WireframeRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WireframeRoom],
    }).compileComponents();

    fixture = TestBed.createComponent(WireframeRoom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
