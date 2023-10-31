export const typeOf = (value: any) => {
  return Object.toString.call(value).slice(8, -1);
};
