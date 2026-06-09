import { PlantResourceType } from './plant.type';

export type FocusSessionType = 'BREATHING' | 'RELAX' | 'STUDY';

export type FocusSessionStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PARTIAL';

export interface FocusSessionOption {
  type: FocusSessionType;
  label: string;
  description: string;
  durations: number[];
  rewardResource: PlantResourceType;
  rewardAmount: number;
  growthReward: number;
}

export interface FocusSessionRecord {
  id: string;
  type: FocusSessionType;
  durationSeconds: number;
  completedSeconds: number;
  status: FocusSessionStatus;
  rewardResource?: PlantResourceType;
  rewardAmount?: number;
  growthReward?: number;
  startedAt: string;
  endedAt?: string;
}
