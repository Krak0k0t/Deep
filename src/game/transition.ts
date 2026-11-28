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
  2: {
    chapter: 2,
    minX: -16,
    maxX: 16,
    minY: -13,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 3,
    completionLabel: 'Глава 2 завершена',
  },
  3: {
    chapter: 3,
    minX: -16,
    maxX: 16,
    minY: -15,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 4,
    completionLabel: 'Глава 3 завершена',
  },
  4: {
    chapter: 4,
    minX: -16,
    maxX: 16,
    minY: -18,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 5,
    completionLabel: 'Глава 4 завершена',
  },
  5: {
    chapter: 5,
    minX: -16,
    maxX: 16,
    minY: -20,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 6,
    completionLabel: 'Глава 5 завершена',
  },
  6: {
    chapter: 6,
    minX: -16,
    maxX: 16,
    minY: -22,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 7,
    completionLabel: 'Глава 6 завершена',
  },
  7: {
    chapter: 7,
    minX: -16,
    maxX: 16,
    minY: -20,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 8,
    completionLabel: 'Глава 7 завершена',
  },
  8: {
    chapter: 8,
    minX: -16,
    maxX: 16,
    minY: -16,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 9,
    completionLabel: 'Глава 8 завершена',
  },
  9: {
    chapter: 9,
    minX: -16,
    maxX: 16,
    minY: -14,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: 10,
    completionLabel: 'Глава 9 завершена',
  },
  10: {
    chapter: 10,
    minX: -16,
    maxX: 16,
    minY: -12,
    maxY: 12,
    minZ: -95,
    maxZ: -83.5,
    nextChapter: null,
    completionLabel: 'Глава 10 завершена',
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
