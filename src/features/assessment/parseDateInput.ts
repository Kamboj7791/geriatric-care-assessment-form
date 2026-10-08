import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// DateInput's default parser is lenient and runs on every keystroke, so half-typed text
// such as '202' became 0202-01-01 and was kept. Only accept a complete date, typed either
// as YYYY-MM-DD or in the format the input displays.
const INPUT_FORMATS = ['YYYY-MM-DD', 'MMMM D, YYYY'];

export const parseDateInput = (text: string) => {
  const date = dayjs(text.trim(), INPUT_FORMATS, true);
  return date.isValid() ? date.format('YYYY-MM-DD') : null;
};
