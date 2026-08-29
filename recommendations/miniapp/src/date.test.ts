import {expect,test} from 'vitest'; import {isoCalendarDate} from './date';
test('uses calendar components rather than UTC conversion',()=>expect(isoCalendarDate(new Date(1990,9,13))).toBe('1990-10-13'));
