import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export const formatDate = (date: string | Date, formatStr: string = 'DD/MM/YYYY') => {
  return dayjs(date).format(formatStr);
};

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};
