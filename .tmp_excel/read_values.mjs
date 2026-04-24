import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const input = await FileBlob.load('/Users/wataru/Downloads/iwami_spots_50.xlsx');
const workbook = await SpreadsheetFile.importXlsx(input);
const sheet = workbook.worksheets.items.find((s) => s.name === 'spots');
if (!sheet) throw new Error('spots sheet not found');
const range = sheet.getRange('A1:AZ120');
const values = range.values;
await fs.writeFile('/Users/wataru/tomoshibi/.tmp_excel/spots_values.json', JSON.stringify(values, null, 2));
console.log('rows', values.length, 'cols', values[0]?.length);
console.log('last non-empty row index', values.map((r,i)=>({i,has:r.some(v=>v!==null&&v!==undefined&&v!=="") })).filter(x=>x.has).slice(-1)[0]);
