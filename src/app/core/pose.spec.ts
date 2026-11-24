import { POSTERS } from './content';
import { POSES, blendPose, easeStep, lookAt } from './pose';
import { STATES } from './states';

describe('poses', () => {
  it('has one pose and one poster for every state', () => {
    for (const s of STATES) {
      expect(POSES[s]).toBeDefined();
      expect(POSTERS[s].title.toLowerCase()).toBe(s);
    }
  });

  it('shows the goggles only in play and the mask only in sleep', () => {
    expect(POSES.play.goggles).toBe(1);
    expect(POSES.work.goggles + POSES.sleep.goggles).toBe(0);
    expect(POSES.sleep.mask).toBe(1);
    expect(POSES.work.mask + POSES.play.mask).toBe(0);
  });

  it('blends from one pose to another and clamps the amount', () => {
    expect(blendPose(POSES.work, POSES.play, 0)).toEqual(POSES.work);
    expect(blendPose(POSES.work, POSES.play, 1)).toEqual(POSES.play);
    expect(blendPose(POSES.work, POSES.play, 2)).toEqual(POSES.play);
    expect(blendPose(POSES.work, POSES.play, 0.5).goggles).toBeCloseTo(0.5);
  });

  it('eases by the same total amount whatever the frame rate', () => {
    const oneStep = easeStep(0.1);
    const twoSteps = 1 - (1 - easeStep(0.05)) ** 2;
    expect(oneStep).toBeCloseTo(twoSteps);
    expect(easeStep(0)).toBe(0);
  });

  it('follows the pointer only as much as the pose allows', () => {
    expect(lookAt(POSES.sleep, 1, 1)).toEqual({ pitch: POSES.sleep.pitch, yaw: POSES.sleep.yaw });
    expect(lookAt(POSES.play, 1, 0).yaw).toBeGreaterThan(POSES.play.yaw);
    expect(lookAt(POSES.play, 5, 0).yaw).toBe(lookAt(POSES.play, 1, 0).yaw);
  });

  it('keeps the page text free of contact details other than the public links', () => {
    const text = JSON.stringify(POSTERS);
    // generic patterns: the real details must not appear here either (this file is public)
    expect(text).not.toMatch(/\+\d{2}[\s\d]{6,}/); // phone numbers
    expect(text).not.toMatch(/\b(born|address|via )\b/i);
    const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [];
    expect(emails.every((e) => e === 'info@voidbrain.net')).toBe(true);
  });
});
