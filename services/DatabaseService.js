import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'blood_pressure.db';
let db = null;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
};

export const initializeDatabase = async () => {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS registros_presion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_hora TEXT NOT NULL,
      sistolica INTEGER NOT NULL,
      diastolica INTEGER NOT NULL,
      pulso INTEGER,
      notas TEXT,
      origen TEXT DEFAULT 'manual',
      archivo_origen TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS preferencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clave TEXT UNIQUE NOT NULL,
      valor TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_fecha_hora ON registros_presion(fecha_hora);
    CREATE INDEX IF NOT EXISTS idx_created_at ON registros_presion(created_at);
  `, []);

  console.log('Database initialized successfully');
};

// CRUD Operations for Registros de Presión

export const createRegistro = async (sistolica, diastolica, pulso = null, notas = '', origen = 'manual', archivoOrigen = null) => {
  const database = await getDatabase();
  const fechaHora = new Date().toISOString();

  const result = await database.runAsync(
    `INSERT INTO registros_presion (fecha_hora, sistolica, diastolica, pulso, notas, origen, archivo_origen)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fechaHora, sistolica, diastolica, pulso, notas, origen, archivoOrigen]
  );

  return {
    id: result.lastInsertRowId,
    fecha_hora: fechaHora,
    sistolica,
    diastolica,
    pulso,
    notas,
    origen,
    archivo_origen: archivoOrigen,
  };
};

export const getRegistros = async (limit = 100, offset = 0) => {
  const database = await getDatabase();

  const registros = await database.getAllAsync(
    `SELECT * FROM registros_presion ORDER BY fecha_hora DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return registros;
};

export const getRegistroById = async (id) => {
  const database = await getDatabase();

  const registro = await database.getFirstAsync(
    `SELECT * FROM registros_presion WHERE id = ?`,
    [id]
  );

  return registro;
};

export const updateRegistro = async (id, sistolica, diastolica, pulso = null, notas = '') => {
  const database = await getDatabase();
  const updatedAt = new Date().toISOString();

  await database.runAsync(
    `UPDATE registros_presion SET sistolica = ?, diastolica = ?, pulso = ?, notas = ?, updated_at = ? WHERE id = ?`,
    [sistolica, diastolica, pulso, notas, updatedAt, id]
  );

  return getRegistroById(id);
};

export const deleteRegistro = async (id) => {
  const database = await getDatabase();

  await database.runAsync(
    `DELETE FROM registros_presion WHERE id = ?`,
    [id]
  );

  return true;
};

export const getRegistrosByDateRange = async (startDate, endDate) => {
  const database = await getDatabase();

  const registros = await database.getAllAsync(
    `SELECT * FROM registros_presion 
     WHERE fecha_hora >= ? AND fecha_hora <= ?
     ORDER BY fecha_hora DESC`,
    [startDate, endDate]
  );

  return registros;
};

export const getRegistrosCount = async () => {
  const database = await getDatabase();

  const result = await database.getFirstAsync(
    `SELECT COUNT(*) as count FROM registros_presion`
  );

  return result.count;
};

export const deleteAllRegistros = async () => {
  const database = await getDatabase();

  await database.runAsync(`DELETE FROM registros_presion`);

  return true;
};

// Preferencias

export const setPreferencia = async (clave, valor) => {
  const database = await getDatabase();

  await database.runAsync(
    `INSERT OR REPLACE INTO preferencias (clave, valor, updated_at)
     VALUES (?, ?, ?)`,
    [clave, valor, new Date().toISOString()]
  );

  return true;
};

export const getPreferencia = async (clave, defaultValue = null) => {
  const database = await getDatabase();

  const result = await database.getFirstAsync(
    `SELECT valor FROM preferencias WHERE clave = ?`,
    [clave]
  );

  return result ? result.valor : defaultValue;
};

export const getAllPreferencias = async () => {
  const database = await getDatabase();

  const preferencias = await database.getAllAsync(
    `SELECT clave, valor FROM preferencias`
  );

  return preferencias.reduce((acc, pref) => {
    acc[pref.clave] = pref.valor;
    return acc;
  }, {});
};
