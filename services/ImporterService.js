import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import cheerio from 'cheerio';
import { createRegistro } from './DatabaseService';
import * as SQLite from 'expo-sqlite';

/**
 * Importa datos desde un archivo Excel (.xlsx)
 * Espera columnas: Fecha, Sistólica, Diastólica, Pulso (opcional), Notas (opcional)
 */
export const importFromExcel = async (fileUri) => {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const workbook = XLSX.read(fileContent, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const importedRegistros = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];

      try {
        // Mapeo flexible de columnas
        const sistolica = parseInt(
          row['Sistólica'] || row['Sistolica'] || row['SBP'] || row['Systolic'] || 0
        );
        const diastolica = parseInt(
          row['Diastólica'] || row['Diastolica'] || row['DBP'] || row['Diastolic'] || 0
        );
        const pulso = parseInt(
          row['Pulso'] || row['HR'] || row['Heart Rate'] || row['Pulse'] || 0
        ) || null;
        const notas = row['Notas'] || row['Notes'] || row['Observaciones'] || '';

        if (sistolica > 0 && diastolica > 0) {
          const registro = await createRegistro(
            sistolica,
            diastolica,
            pulso,
            notas,
            'import_excel',
            fileUri
          );
          importedRegistros.push(registro);
        } else {
          errors.push(`Fila ${i + 2}: Valores de presión inválidos`);
        }
      } catch (error) {
        errors.push(`Fila ${i + 2}: ${error.message}`);
      }
    }

    return {
      success: true,
      imported: importedRegistros.length,
      errors,
      registros: importedRegistros,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error.message],
      registros: [],
    };
  }
};

/**
 * Importa datos desde un archivo HTML
 * Busca tablas con datos de presión arterial
 */
export const importFromHTML = async (fileUri) => {
  try {
    const htmlContent = await FileSystem.readAsStringAsync(fileUri);
    const $ = cheerio.load(htmlContent);

    const importedRegistros = [];
    const errors = [];

    // Buscar todas las tablas
    const tables = $('table');

    tables.each((tableIndex, table) => {
      const rows = $(table).find('tr');

      rows.each((rowIndex, row) => {
        if (rowIndex === 0) return; // Saltar encabezados

        try {
          const cells = $(row).find('td');
          if (cells.length < 2) return;

          const sistolica = parseInt($(cells[0]).text().trim());
          const diastolica = parseInt($(cells[1]).text().trim());
          const pulso = cells.length > 2 ? parseInt($(cells[2]).text().trim()) : null;
          const notas = cells.length > 3 ? $(cells[3]).text().trim() : '';

          if (sistolica > 0 && diastolica > 0) {
            createRegistro(
              sistolica,
              diastolica,
              isNaN(pulso) ? null : pulso,
              notas,
              'import_html',
              fileUri
            ).then(registro => {
              importedRegistros.push(registro);
            });
          }
        } catch (error) {
          errors.push(`Fila ${rowIndex + 1}: ${error.message}`);
        }
      });
    });

    return {
      success: true,
      imported: importedRegistros.length,
      errors,
      registros: importedRegistros,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error.message],
      registros: [],
    };
  }
};

/**
 * Importa datos desde una base de datos SQLite
 */
export const importFromDatabase = async (fileUri) => {
  try {
    // Abrir la base de datos fuente
    const sourceDb = await SQLite.openDatabaseAsync(fileUri);

    // Leer registros de la base de datos fuente
    const sourceRegistros = await sourceDb.getAllAsync(
      `SELECT sistolica, diastolica, pulso, notas, fecha_hora 
       FROM registros_presion ORDER BY fecha_hora DESC`
    );

    const importedRegistros = [];
    const errors = [];

    for (const registro of sourceRegistros) {
      try {
        const newRegistro = await createRegistro(
          registro.sistolica,
          registro.diastolica,
          registro.pulso,
          registro.notas,
          'import_database',
          fileUri
        );
        importedRegistros.push(newRegistro);
      } catch (error) {
        errors.push(`Error importando registro: ${error.message}`);
      }
    }

    await sourceDb.closeAsync();

    return {
      success: true,
      imported: importedRegistros.length,
      errors,
      registros: importedRegistros,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error.message],
      registros: [],
    };
  }
};

/**
 * Importa datos desde CSV
 */
export const importFromCSV = async (fileUri) => {
  try {
    const csvContent = await FileSystem.readAsStringAsync(fileUri);
    const lines = csvContent.split('\n');

    const importedRegistros = [];
    const errors = [];

    // Detectar separador (coma o punto y coma)
    const separator = lines[0].includes(';') ? ';' : ',';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(separator).map(v => v.trim());

        const sistolica = parseInt(values[0]);
        const diastolica = parseInt(values[1]);
        const pulso = values.length > 2 ? parseInt(values[2]) : null;
        const notas = values.length > 3 ? values[3] : '';

        if (sistolica > 0 && diastolica > 0) {
          const registro = await createRegistro(
            sistolica,
            diastolica,
            isNaN(pulso) ? null : pulso,
            notas,
            'import_csv',
            fileUri
          );
          importedRegistros.push(registro);
        } else {
          errors.push(`Línea ${i + 1}: Valores de presión inválidos`);
        }
      } catch (error) {
        errors.push(`Línea ${i + 1}: ${error.message}`);
      }
    }

    return {
      success: true,
      imported: importedRegistros.length,
      errors,
      registros: importedRegistros,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [error.message],
      registros: [],
    };
  }
};

/**
 * Detecta el tipo de archivo y llama al importador apropiado
 */
export const importFile = async (fileUri, fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  switch (extension) {
    case 'xlsx':
    case 'xls':
      return importFromExcel(fileUri);
    case 'html':
    case 'htm':
      return importFromHTML(fileUri);
    case 'db':
    case 'sqlite':
      return importFromDatabase(fileUri);
    case 'csv':
      return importFromCSV(fileUri);
    default:
      return {
        success: false,
        imported: 0,
        errors: [`Formato de archivo no soportado: ${extension}`],
        registros: [],
      };
  }
};
