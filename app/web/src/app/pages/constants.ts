// Mock 데이터 타입 정의
export interface VolumeData {
  date: string;
  chest: number;
  back: number;
  legs: number;
}

export interface Workout {
  id: number;
  date: string;
  name: string;
  duration: string;
  volume: string;
}

export interface Routine {
  id: string;
  name: string;
  target: string;
  exercises: number;
}

export interface Exercise {
  id: string;
  name: string;
  target: string;
}

// Mock 데이터
export const VOLUME_DATA: VolumeData[] = [
  { date: '2024-05-18', chest: 1200, back: 800, legs: 0 },
  { date: '2024-05-19', chest: 0, back: 0, legs: 2500 },
  { date: '2024-05-20', chest: 400, back: 1500, legs: 0 },
  { date: '2024-05-21', chest: 1500, back: 0, legs: 500 },
  { date: '2024-05-22', chest: 0, back: 1800, legs: 0 },
  { date: '2024-05-23', chest: 2000, back: 0, legs: 3000 },
  { date: '2024-05-24', chest: 0, back: 500, legs: 0 },
];

export const RECENT_WORKOUTS: Workout[] = [
  { id: 1, date: '2024-05-18', name: '등 & 이두 (Pull)', duration: '65m', volume: '4,200kg' },
  { id: 2, date: '2024-05-16', name: '가슴 & 삼두 (Push)', duration: '55m', volume: '3,800kg' },
];

export const DEFAULT_ROUTINES: Routine[] = [
  { id: 'r1', name: '상체 위주 루틴', target: '가슴, 등', exercises: 5 },
  { id: 'r2', name: '하체 박살 루틴', target: '쿼드, 둔근', exercises: 6 },
];

export const EXERCISE_LIBRARY: Exercise[] = [
  { id: 'e1', name: '스쿼트', target: 'Legs' },
  { id: 'e2', name: '데드리프트', target: 'Back/Legs' },
  { id: 'e3', name: '숄더 프레스', target: 'Shoulders' },
  { id: 'e4', name: '풀업', target: 'Back' },
  { id: 'e5', name: '바벨 로우', target: 'Back' },
];