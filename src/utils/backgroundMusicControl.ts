/**
 * Module-level event bus để pause/resume nhạc nền từ bất kỳ đâu
 * mà không cần context phức tạp.
 */
type Listener = () => void;
const pauseListeners: Listener[] = [];
const resumeListeners: Listener[] = [];

export const backgroundMusicControl = {
  /** Yêu cầu dừng nhạc nền (gọi khi calm music bắt đầu) */
  pause() {
    pauseListeners.forEach(l => l());
  },
  /** Yêu cầu khôi phục nhạc nền (gọi khi calm music kết thúc) */
  resume() {
    resumeListeners.forEach(l => l());
  },
  onPause(listener: Listener) {
    pauseListeners.push(listener);
    return () => {
      const i = pauseListeners.indexOf(listener);
      if (i !== -1) pauseListeners.splice(i, 1);
    };
  },
  onResume(listener: Listener) {
    resumeListeners.push(listener);
    return () => {
      const i = resumeListeners.indexOf(listener);
      if (i !== -1) resumeListeners.splice(i, 1);
    };
  },
};
