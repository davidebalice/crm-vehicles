# Migrazione da PostgreSQL a MySQL

## Introduzione
Questo documento descrive il processo di migrazione dal database PostgreSQL attuale a MySQL.

## Strategia di migrazione

### 1. Adattatore Database

Per supportare MySQL è stato creato un adattatore (`server/db-adapter.ts`) che astrae le operazioni database specifiche. 
L'adattatore si occupa di:
- Fornire un'interfaccia comune per le query
- Gestire le differenze di sintassi tra PostgreSQL e MySQL
- Permettere una migrazione graduale

### 2. File di configurazione MySQL

È stato preparato un file di configurazione MySQL (`server/db.ts`) che contiene le connessioni necessarie.

### 3. Differenze negli schemi

Le principali differenze tra PostgreSQL e MySQL che richiedono attenzione:

#### Tipi di dati
- PostgreSQL `serial` diventa `int auto_increment` in MySQL
- PostgreSQL `text` diventa `longtext` in MySQL
- PostgreSQL `jsonb` diventa `json` in MySQL
- I tipi `timestamp` hanno comportamenti diversi

#### Sintassi SQL
- PostgreSQL usa `ILIKE` per ricerche case-insensitive, MySQL usa `LIKE` con funzioni `LOWER()`
- Le funzioni di aggregazione hanno sintassi diverse
- PostgreSQL ha `RETURNING`, MySQL richiede query separate

#### Indici e chiavi
- La creazione di indici ha sintassi diverse
- MySQL richiede chiavi esterne esplicite

### 4. Conversione dello schema

Il file `pg2mysql/schema_mysql.ts` contiene lo schema convertito per MySQL. Questa conversione include:
- Tutti i modelli di tabella usando `mysqlTable` invece di `pgTable`
- Tipi di dato convertiti appropriatamente
- Adattamenti per le relazioni

### 5. Modifiche al codice per supportare MySQL

Per completare la migrazione, i seguenti file richiedono modifiche:

- `server/db.ts`: Aggiornare per usare `mysql2` invece di `pg`
- `server/storage.ts`: Modificare le query per supportare la sintassi MySQL
- `server/auth.ts`: Aggiornare per usare session store compatibile con MySQL
- `server/migrations.ts`: Adattare per supportare migrazioni MySQL

### 6. Migrazione dati

Per la migrazione dei dati, sarà necessario:
1. Esportare i dati da PostgreSQL
2. Convertire il formato (principalmente date e JSON)
3. Importare i dati in MySQL

## Implementazione attuale

Al momento, l'implementazione è parziale e include:
- Adapter pattern per astrarre il database (`server/db-adapter.ts`)
- Configurazione MySQL preparata (`server/db.ts`)
- Schema MySQL convertito (`pg2mysql/schema_mysql.ts`)

## Prossimi passi

1. Installare le dipendenze MySQL necessarie
2. Adattare tutte le query in `storage.ts` per supportare MySQL
3. Implementare la migrazione dati
4. Testare l'applicazione con MySQL
5. Pianificare il passaggio definitivo a MySQL

## Note tecniche

- MySQL non supporta `RETURNING` nelle query INSERT/UPDATE/DELETE
- Gli errori LSP attuali sono dovuti alla mancanza delle dipendenze e ai tipi per MySQL
- Le espressioni SQL come `db.sql` devono essere riscritte per MySQL