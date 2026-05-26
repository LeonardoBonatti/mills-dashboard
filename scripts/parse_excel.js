import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_PATH = 'C:\\Users\\Leonardo Bonatti\\OneDrive\\Desktop\\Documentos do Trabalho\\Dados Ficticios_Mills.xlsx';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Reading Excel file from: ${EXCEL_PATH}`);

try {
  const workbook = xlsx.readFile(EXCEL_PATH);
  const targetSheets = [
    'Base_Manutenção', 'Controle_Filas', 'Peças', 'Falhas',
    'KPIs_Volume', 'KPIs_LSA', 'KPIs_Etapas', 'KPIs_Gargalos',
    'Análise_Falhas', 'Orçamento_Aprovação', 'Processo_Melhoria',
    'Calendário', 'VisionLink_Brutos', 'Oficina_Brutos',
    'SAP_Brutos', 'Alertas_Brutos', 'Fluidos_Brutos'
  ];

  targetSheets.forEach(sheetName => {
    if (workbook.SheetNames.includes(sheetName)) {
      console.log(`Parsing sheet: ${sheetName}`);
      const sheet = workbook.Sheets[sheetName];
      
      // The headers are usually on the second row (range: 1 skips the first row)
      let data = xlsx.utils.sheet_to_json(sheet, { defval: null, range: 1 });
      
      // Clean keys: If the first object has keys like '__EMPTY', the headers might be in row 1 or row 0.
      // But we enforce range: 1. Let's do some data cleansing.
      let cleanedData = [];

      data.forEach(row => {
        let newRow = {};
        for (let key in row) {
          // If the key is __EMPTY, we can't do much if we don't have the real header, but we keep the value.
          // In 'Base_Manutenção', the header is actually parsed correctly if we use range: 1, 
          // because row index 1 has 'ID_OS', 'Centro Trab', etc. Wait! 
          // In my previous test, row index 1 (the 2nd row) had:
          // {'BASE DE MANUTENÇÃO': 'ID_OS', '__EMPTY': 'Centro Trab', ...}
          // This means xlsx used row index 0 as headers. Let's fix this by reading with range: 1 but with header: 1 (array of arrays).
        }
      });
      
      // Better approach: read as array of arrays to find the header row, then map.
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
      if (rows.length > 1) {
        // Assume row 1 (second row) is the header
        const headers = rows[1].map((h, i) => h ? h.toString().trim() : `Col_${i}`);
        
        // Data starts at row 2
        for (let i = 2; i < rows.length; i++) {
          const rowArray = rows[i];
          if (!rowArray || rowArray.length === 0) continue;
          
          let obj = {};
          let isEmptyRow = true;
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = rowArray[j];
            if (rowArray[j] !== null && rowArray[j] !== '') isEmptyRow = false;
          }
          
          if (!isEmptyRow) {
            // Apply Global Filters: Only Sumaré and only Caterpillar
            let filial = (obj['Filial'] || obj['Nome Filial'] || obj['Oficina'] || '').toString().toUpperCase();
            let equip = (obj['TEXTO_OS'] || obj['Desc TAM'] || obj['Marca'] || obj['Modelo'] || obj['Equipamento'] || '').toString().toUpperCase();
            
            let isSumare = true;
            let isCat = true;

            // Restrict to Sumaré if a filial field exists
            if (filial && filial !== 'COL_0') {
              if (!filial.includes('SUMARÉ') && !filial.includes('SUMARE')) {
                isSumare = false;
              }
            }

            // Exclude non-Caterpillar
            if (equip && equip !== 'COL_0') {
              const nonCatBrands = ['VOLVO', 'JOHN DEERE', 'HYUNDAI', 'JCB', 'CASE', 'HITACHI', 'KOMATSU'];
              if (nonCatBrands.some(b => equip.includes(b))) {
                isCat = false;
              }
            }

            if (isSumare && isCat) {
              cleanedData.push(obj);
            }
          }
        }
      }

      const outputPath = path.join(OUTPUT_DIR, `${sheetName}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf-8');
      console.log(`Saved ${sheetName}.json with ${cleanedData.length} records.`);
    }
  });

  console.log('Data parsing completed successfully!');
} catch (error) {
  console.error('Error parsing Excel file:', error);
}
