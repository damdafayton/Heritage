// Note: import explicitly to use the types shiped with jest.
import {test, expect} from '@jest/globals';

import {findYearsPassed} from '../findYearsPassed';

test('findYearsPassed() calculates the years passed since the given timestamp', () => {
  const thisYear = new Date().getFullYear();

  const twoYearsAgo = new Date().setFullYear(thisYear - 2);

  expect(findYearsPassed(twoYearsAgo)).toBe(3);
});
