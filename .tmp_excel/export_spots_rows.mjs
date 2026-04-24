import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const xlsxPath = '/Users/wataru/Downloads/iwami_spots_50.xlsx';
const outPath = '/Users/wataru/tomoshibi/.tmp_excel/spots_rows.ndjson';
const input = await FileBlob.load(xlsxPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const inspect = await workbook.inspect({
  kind: 'table',
  range: 'spots!A1:AZ120',
  include: 'values',
  tableMaxRows: 120,
  tableMaxCols: 52,
});

await fs.writeFile(outPath, inspect.ndjson);
console.log(`wrote ${outPath}`);
console.log(inspect.ndjson.split('\n')[0]);
