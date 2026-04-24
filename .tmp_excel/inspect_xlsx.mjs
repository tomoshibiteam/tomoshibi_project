import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const xlsxPath = '/Users/wataru/Downloads/iwami_spots_50.xlsx';
const input = await FileBlob.load(xlsxPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheets = workbook.worksheets.items.map((s) => ({ id: s.id, name: s.name }));
console.log('SHEETS', JSON.stringify(sheets, null, 2));

for (const sheet of workbook.worksheets.items) {
  const inspect = await workbook.inspect({
    kind: 'table',
    sheetId: sheet.id,
    range: 'A1:AZ12',
    include: 'values',
    tableMaxRows: 12,
    tableMaxCols: 52,
  });
  console.log(`\n=== SHEET: ${sheet.name} ===`);
  console.log(inspect.ndjson);
}
