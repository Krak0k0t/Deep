import { ChapterId } from './campaign';
import { Vec3 } from './npc';

export interface ChapterTransitionTrigger {
  chapter: ChapterId;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  nextChapter: ChapterId | null;
  completionLabel: string;
}

export const CHAPTER_TRANSITIONS: Partial<
  Record<ChapterId, ChapterTransitionTrigger>
> = {
  1: {
    chapter: 1,
    minX: -16,
    maxX: 16,
    minY: -9,
    maxY: 11,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 2,
    completionLabel: 'Глава 1 завершена',
  },
};

export function isInsideTransitionTrigger(
  pos: Vec3,
  trigger: ChapterTransitionTrigger,
): boolean {
  return (
    pos.x >= trigger.minX &&
    pos.x <= trigger.maxX &&
    pos.y >= trigger.minY &&
    pos.y <= trigger.maxY &&
    pos.z >= trigger.minZ &&
    pos.z <= trigger.maxZ
  );
}
