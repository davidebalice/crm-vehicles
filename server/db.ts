/*
import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();


// Funzione SQL per query con parametri
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((result, str, i) => {
    return result + str + (i < values.length ? "?" : "");
  }, "");
  return {
    text: query,
    values: values,
  };
};

// Funzione di connessione a MySQL
export async function getConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
    });
    return connection;
  } catch (error) {
    console.error("Error connecting to MySQL:", error);
    throw error;
  }
}

// DB helper semplificato
export const db = {
  async execute(query: any, params?: any[]) {
    const connection = await getConnection();
    const [rows] = await connection.execute(query.text || query, params || []);
    connection.end(); // Chiudi la connessione dopo l'esecuzione della query
    return rows;
  },
  async select() {
    return {
      from: (table: any) => {
        return {
          where: async (condition: any) => {
            // Stub: logica futura con query builder
            return [];
          },
        };
      },
    };
  },
  async insert(table: any) {
    return {
      values: (values: any) => {
        return {
          returning: async () => {
            // Stub: logica futura
            return [];
          },
        };
      },
    };
  },
};

export async function testQuery() {
  console.log("testQuery test");
  try {
    const query = sql`SELECT * FROM users WHERE username = 'admin'`;
    const results = await db.execute(query);
    console.log("results test");
    console.log(results);
  } catch (error) {
    console.error("Errore durante l'esecuzione della query:", error);
  }
}

testQuery();

// Test della connessione
export async function testConnection() {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.end();
    console.log("MySQL connection test successful");
    return true;
  } catch (error) {
    console.error("MySQL connection test failed:", error);
    return false;
  }
}

// Inizializzazione del database
export async function initializeDatabase() {
  try {
    const connection = await getConnection();
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Existing tables:", tables);
    connection.end();
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Pulizia del database (solo per test/dev)
export async function cleanDatabase() {
  try {
    console.warn(
      "Clean database called - this should not be used in production!"
    );
    return true;
  } catch (error) {
    console.error("Failed to clean database:", error);
    return false;
  }
}


*/

/*
con pool
*/
import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

// Crea un pool di connessioni
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  keepAliveInitialDelay: 10000, // 0 by default.
  enableKeepAlive: true, // false by default.
});

// Funzione di connessione al pool
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Connessione ottenuta dal pool");
    return connection;
  } catch (error) {
    console.error(
      "Errore durante l'ottenimento della connessione dal pool:",
      error
    );
    throw error;
  }
}

// Funzione SQL per query con parametri
export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((result, str, i) => {
    return result + str + (i < values.length ? "?" : "");
  }, "");
  return {
    text: query,
    values: values,
  };
};

// DB helper semplificato
export const db = {
  async execute(query: any, params?: any[]) {
    let connection;
    try {
      // Ottieni la connessione dal pool
      connection = await getConnection();

      // Verifica lo stato della connessione
      try {
        await connection.ping();
      } catch (error) {
        console.error(
          "La connessione non è valida prima di eseguire la query"
        );
        throw new Error("Connessione non valida");
      }

      // Verifica che la query sia valida
      const queryText = query.text || query; // Usa query direttamente se non ha `text`
      console.log("Esecuzione query: ", queryText);
      console.log("Esecuzione con parametri:", params);

      // Esegui la query
      const [rows] = await connection.execute(queryText, params || []);
      console.log("Query eseguita con successo");

      return rows;
    } catch (error) {
      console.error("Errore durante l'esecuzione della query:", error);
      throw error;
    } finally {
      if (connection) {
        console.log("Rilascio connessione al pool");
        connection.release(); // Rilascia la connessione al pool
      }
    }
  },
  async select() {
    return {
      from: (table: any) => {
        return {
          where: async (condition: any) => {
            return [];
          },
        };
      },
    };
  },
  async insert(table: any) {
    return {
      values: (values: any) => {
        return {
          returning: async () => {
            return [];
          },
        };
      },
    };
  },
};

// Test della query
export async function testQuery() {
  console.log("testQuery test");
  try {
    const query = sql`SELECT * FROM users WHERE username = 'admin'`;
    const results = await db.execute(query);
    console.log("results test");
    console.log(results);
  } catch (error) {
    console.error("Errore durante l'esecuzione della query:", error);
  }
}

testQuery();

// Test della connessione
export async function testConnection() {
  try {
    const connection = await getConnection();
    await connection.ping();
    console.log("Test di connessione riuscito");
    return true;
  } catch (error) {
    console.error("Test di connessione fallito:", error);
    return false;
  }
}

// Inizializzazione del database
export async function initializeDatabase() {
  try {
    const connection = await getConnection();
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Tabelle esistenti:", tables);
    return true;
  } catch (error) {
    console.error("Inizializzazione del database fallita:", error);
    throw error;
  }
}

// Pulizia del database (solo per test/dev)
export async function cleanDatabase() {
  try {
    console.warn(
      "Clean database called - this should not be used in production!"
    );
    return true;
  } catch (error) {
    console.error("Pulizia del database fallita:", error);
    return false;
  }
}
