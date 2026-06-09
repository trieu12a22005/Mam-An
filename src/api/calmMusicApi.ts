import axiosClient from './axiosClient';

export interface CalmMusicTrack {
  id: string;
  titleVi: string;        // Tên tiếng Việt hiển thị
  hasLyrics: boolean;     // true = có lời, false = không lời
  category: string;       // rain | nature | piano | lofi | general
  publicUrl: string;      // URL stream trực tiếp
  storagePath: string;
  originalName?: string;
  createdAt: string;
}

export async function fetchCalmMusicTracks(params?: {
  category?: string;
  hasLyrics?: boolean;
}): Promise<CalmMusicTrack[]> {
  const { data } = await axiosClient.get<{ data: CalmMusicTrack[]; total: number }>(
    '/calm-music',
    { params }
  );
  return data.data ?? [];
}
