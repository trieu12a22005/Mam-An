export type MoodType =
  | "HAPPY"
  | "CALM"
  | "NORMAL"
  | "SAD"
  | "ANXIOUS"
  | "TIRED";

/** @deprecated — dùng MoodType thay thế */
export type MoodLevel = MoodType;

export interface MoodJournal {
  id: string;
  mood: MoodType;
  note?: string;
  aiReply?: string;
  createdAt: string;
}
