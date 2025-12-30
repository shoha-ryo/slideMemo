export const getObjectDiff = <T extends object>(
  oldObj: T,
  newObj: T,
): Partial<T> => {
  const diff: Partial<T> = {};
  (Object.keys(newObj) as Array<keyof T>).forEach((key) => {
    if (newObj[key] !== oldObj[key]) {
      // 配列の場合は中身を比較（参照が変わるため）
      if (Array.isArray(newObj[key])) {
        if (JSON.stringify(newObj[key]) !== JSON.stringify(oldObj[key])) {
          diff[key] = newObj[key];
        }
      } else {
        diff[key] = newObj[key];
      }
    }
  });
  return diff;
};
