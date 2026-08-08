import fs from 'fs';
import path from 'path';
import { CandidateProfile, CurriculumData, CurriculumDay } from '../types';

let cachedCurriculum: CurriculumData | null = null;

export function loadCurriculum(): CurriculumData {
  if (cachedCurriculum) return cachedCurriculum;

  const possiblePaths: string[] = [];
  if (process.env.CURRICULUM_PATH) {
    possiblePaths.push(process.env.CURRICULUM_PATH);
  }
  
  possiblePaths.push(
    path.join(process.cwd(), 'curriculum.json'), // Docker root
    path.join(process.cwd(), '../curriculum.json'), // Local dev from backend dir
    path.join(__dirname, '../../../../curriculum.json') // Absolute fallback
  );

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf-8');
      cachedCurriculum = JSON.parse(data) as CurriculumData;
      return cachedCurriculum;
    }
  }

  throw new Error(`curriculum.json not found. Checked paths:\n${possiblePaths.join('\n')}`);
}

export function getCurriculumDayMap(): Map<number, CurriculumDay> {
  const curriculum = loadCurriculum();
  const map = new Map<number, CurriculumDay>();
  for (const d of curriculum.days) {
    map.set(d.day, d);
  }
  return map;
}

export function planCandidateInterview(candidate: CandidateProfile): {
  targetDays: number[];
  dayDetails: CurriculumDay[];
} {
  const dayMap = getCurriculumDayMap();
  
  // 1. Identify completed missions
  const completedMissions = candidate.missions.filter(m => m.passed === true);
  
  // Extract passed days that exist in curriculum
  const passedDays = completedMissions
    .map(m => m.day)
    .filter(day => dayMap.has(day));

  // If candidate has fewer than 4 completed days, add extra available curriculum days to satisfy >= 4 days rule
  const targetDaySet = new Set<number>(passedDays);

  if (targetDaySet.size < 4) {
    const allDays = Array.from(dayMap.keys());
    for (const d of allDays) {
      targetDaySet.add(d);
      if (targetDaySet.size >= 6) break;
    }
  }

  // Sort target days in chronological curriculum order
  const targetDays = Array.from(targetDaySet).sort((a, b) => a - b);
  const dayDetails = targetDays.map(d => dayMap.get(d)!);

  return { targetDays, dayDetails };
}
