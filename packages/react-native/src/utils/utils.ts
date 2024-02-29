export const sleep = (ms = 3000) =>
  new Promise(resolve => setTimeout(resolve, ms));
