import { get } from '../service/fetcher';
import { toList } from '../service/google-sheet';

const DEFAULT_GOOGLE_SHEET = '1LkEItqLwSQuVPmtX0OKoQYy2jd4mL2Sc0BpHnRd49Y0';

export function getD3Data(page, pageSize, sheetId) {
  const googleSheetId = sheetId || DEFAULT_GOOGLE_SHEET;
  return get([`https://spreadsheets.google.com/feeds/list/${googleSheetId}/1/public/values?alt=json`])
    .then(toList);
};

export function getInsights(page, pageSize, sheetId) {
  const googleSheetId = sheetId || DEFAULT_GOOGLE_SHEET;
  return get([`https://spreadsheets.google.com/feeds/list/${googleSheetId}/2/public/values?alt=json`])
    .then(toList);
};

export function getPeople(page, pageSize, sheetId) {
  const googleSheetId = sheetId || DEFAULT_GOOGLE_SHEET;
  return get([`https://spreadsheets.google.com/feeds/list/${googleSheetId}/3/public/values?alt=json`])
  .then((data) => {
    return toList(data).filter((entry) => {
      return (typeof entry.lat === 'string') && entry.lat.length > 0 && entry.lat !== 'ZERO_RESULTS';
    });
  });
};

export function getEvents(page, pageSize, sheetId) {
  const googleSheetId = sheetId || DEFAULT_GOOGLE_SHEET;
  return get([`https://spreadsheets.google.com/feeds/list/${googleSheetId}/4/public/values?alt=json`])
    .then(toList);
};
