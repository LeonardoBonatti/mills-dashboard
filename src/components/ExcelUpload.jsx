import React, { useRef, useState } from 'react';
import * as xlsx from 'xlsx';
import { UploadCloud } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { normalizeOS } from '../utils/dataUtils';

const ExcelUpload = () => {
  const fileInputRef = useRef(null);
  const { setGlobalData } = useDashboard();
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = xlsx.read(data, { type: 'array' });
        
        // Prefer 'Base_Manutenção' if available, otherwise grab the first sheet
        const sheetName = workbook.SheetNames.includes('Base_Manutenção') 
          ? 'Base_Manutenção' 
          : workbook.SheetNames[0];
          
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        
        let extractedData = [];
        if (rows.length > 1) {
          // Try to identify headers. Usually row 1 is headers in this specific spreadsheet.
          // If row 0 has more strings, it might be row 0. Let's assume row 1 as per original script.
          // Fallback to row 0 if row 1 is empty or doesn't have ID_OS.
          let headerRowIndex = 1;
          const row1Str = rows[1]?.join('') || '';
          if (!row1Str.includes('ID_OS') && (rows[0]?.join('') || '').includes('ID_OS')) {
            headerRowIndex = 0;
          }

          const headers = rows[headerRowIndex].map((h, i) => h ? h.toString().trim() : `Col_${i}`);
          
          for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const rowArray = rows[i];
            if (!rowArray || rowArray.length === 0) continue;
            
            let obj = {};
            let isEmptyRow = true;
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = rowArray[j];
              if (rowArray[j] !== null && rowArray[j] !== '') isEmptyRow = false;
            }
            if (!isEmptyRow) {
              extractedData.push(obj);
            }
          }
        } else {
          extractedData = xlsx.utils.sheet_to_json(sheet, { defval: null });
        }

        const newGlobalData = extractedData
          .map(normalizeOS)
          .filter(Boolean)
          .filter(row => typeof row.ID_OS === 'number' || (typeof row.ID_OS === 'string' && row.ID_OS.trim() !== ''));

        if (newGlobalData.length > 0) {
          setGlobalData(newGlobalData);
          alert(`Planilha carregada com sucesso! ${newGlobalData.length} registros encontrados.`);
        } else {
          alert('Nenhum dado válido encontrado na planilha. Verifique o formato.');
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao ler o arquivo Excel.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset input so the same file can be selected again
    e.target.value = null;
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />
      <button 
        onClick={() => fileInputRef.current.click()} 
        disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'var(--accent-glow)', color: 'var(--accent-primary)', 
          border: '1px solid var(--accent-primary)', padding: '6px 12px', 
          borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', 
          fontSize: '0.85rem', fontWeight: '600'
        }}
      >
        <UploadCloud size={16} />
        {loading ? 'Lendo...' : 'Importar Excel'}
      </button>
    </div>
  );
};

export default ExcelUpload;
