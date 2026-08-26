/** Demo PM photos from Images_PM (copied into assets/pm). */
export const PM_DEMO_PHOTOS = [
  {
    source: require('../../assets/pm/pm-1.png'),
    remark: 'Overview of inspection area',
  },
  {
    source: require('../../assets/pm/pm-2.jpeg'),
    remark: 'Close-up of equipment condition',
  },
  {
    source: require('../../assets/pm/pm-3.webp'),
    remark: 'Surrounding area / accessories',
  },
  {
    source: require('../../assets/pm/pm-4.jpg'),
    remark: 'Additional evidence photo',
  },
] as const;

export const getPmDemoPhotoSeed = (slotCount = 3) => {
  const count = Math.max(1, Math.min(slotCount, PM_DEMO_PHOTOS.length));
  return {
    options: Array.from({ length: count }, (_, index) => PM_DEMO_PHOTOS[index].remark),
    values: Array.from({ length: count }, (_, index) => `pm-demo:${index}`),
  };
};

export const resolvePmDemoPhotoSource = (value: string) => {
  const match = /^pm-demo:(\d+)$/.exec(String(value || ''));
  if (!match) return null;
  const index = Number(match[1]);
  return PM_DEMO_PHOTOS[index]?.source ?? null;
};
