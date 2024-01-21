export function findYearsPassed(date: number): number {
  const givenYear = new Date(date).getFullYear();
  const thisYear = new Date().getFullYear();

  return thisYear - givenYear + 1;
}
