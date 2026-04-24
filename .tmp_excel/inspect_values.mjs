import fs from 'node:fs/promises';
const values = JSON.parse(await fs.readFile('/Users/wataru/tomoshibi/.tmp_excel/spots_values.json', 'utf8'));
const header = values[0];
console.log('cols', header.length);
console.log(header.map((h, i) => `${i+1}:${h}`).join('\n'));
let dataRows = 0;
for (let i=1;i<values.length;i++) {
  const row = values[i];
  if (row.some((v) => v !== null && v !== undefined && v !== '')) dataRows++;
}
console.log('dataRows', dataRows);
