import { CalmMusicTrack } from '../api/calmMusicApi';
import { FocusSessionOption } from '../types/focusSession.type';

/**
 * Module-level store để truyền dữ liệu giữa calm-space ↔ zen-setup ↔ music-select
 * mà không cần Context hay navigation params phức tạp.
 */
interface PendingSession {
  option: FocusSessionOption;
  duration: number;
  selectedTrack: CalmMusicTrack | null;
  zenPlantId: string | null;   // ID cây đã chọn ở zen-setup
  confirmed: boolean;
}

let _store: PendingSession | null = null;

export const calmSessionStore = {
  /** Đặt session đang chờ chọn cây + nhạc */
  setPending(option: FocusSessionOption, duration: number) {
    _store = { option, duration, selectedTrack: null, zenPlantId: null, confirmed: false };
  },
  /** Lưu ID cây Zen đã chọn */
  setZenPlantId(id: string | null) {
    if (_store) _store.zenPlantId = id;
  },
  /** Lưu track đã chọn */
  setTrack(track: CalmMusicTrack | null) {
    if (_store) _store.selectedTrack = track;
  },
  /** Đánh dấu người dùng đã xác nhận bắt đầu */
  confirm() {
    if (_store) _store.confirmed = true;
  },
  get(): PendingSession | null { return _store; },
  clear() { _store = null; },
};
