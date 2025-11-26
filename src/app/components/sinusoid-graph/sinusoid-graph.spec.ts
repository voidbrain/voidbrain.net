import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinusoidGraph } from './sinusoid-graph';

describe('SinusoidGraph', () => {
  let component: SinusoidGraph;
  let fixture: ComponentFixture<SinusoidGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinusoidGraph],
    }).compileComponents();

    fixture = TestBed.createComponent(SinusoidGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
