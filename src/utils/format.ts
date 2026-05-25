export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};
