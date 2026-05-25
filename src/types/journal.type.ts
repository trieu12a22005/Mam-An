export type MoodLevel = "VERY_BAD" | "BAD" | "NORMAL" | "GOOD" | "VERY_GOOD";

export interface MoodJournal {
  id: string;
  mood: MoodLevel;
  note?: string;
  createdAt: string;
}
