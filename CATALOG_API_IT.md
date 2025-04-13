# API Documentazione Catalogo Veicoli

Questa documentazione descrive le API disponibili per l'integrazione del catalogo veicoli con sistemi esterni.

## Indice

1. [Introduzione](#introduzione)
2. [Autenticazione](#autenticazione)
3. [Formato Dati](#formato-dati)
4. [API Disponibili](#api-disponibili)
    - [Esportazione Catalogo](#esportazione-catalogo)
    - [Importazione Catalogo](#importazione-catalogo)
5. [Esempi](#esempi)
6. [Gestione Errori](#gestione-errori)

## Introduzione

Il sistema di gestione concessionaria offre API per l'importazione ed esportazione del catalogo veicoli completo, includendo gerarchie di marche, modelli e veicoli specifici. Queste API sono progettate per consentire l'integrazione con siti web, applicazioni e altri sistemi di gestione.

## Autenticazione

Tutte le richieste API richiedono autenticazione. Attualmente il sistema utilizza un'autenticazione semplice per scopi MVP, ma in produzione verrà implementato un sistema di autenticazione basato su JWT o chiavi API.

## Formato Dati

Le API utilizzano JSON come formato di interscambio dati. La struttura gerarchica del catalogo è la seguente:

```
Catalogo
  └── Marche (Ford, Fiat, ecc.)
       └── Modelli (Mustang, 500, ecc.)
            └── Veicoli (istanze specifiche)
```

### Schema Marca

| Campo      | Tipo     | Descrizione                                  | Obbligatorio |
|------------|----------|----------------------------------------------|--------------|
| id         | Numero   | ID univoco (solo in esportazione)            | No           |
| name       | Testo    | Nome della marca                             | Sì           |
| type       | Testo    | Tipo ("car" o "motorcycle")                  | Sì           |
| logoUrl    | URL      | URL del logo della marca                     | No           |
| models     | Array    | Lista dei modelli associati                  | No           |

### Schema Modello

| Campo          | Tipo     | Descrizione                                | Obbligatorio |
|----------------|----------|-------------------------------------------|--------------|
| id             | Numero   | ID univoco (solo in esportazione)          | No           |
| name           | Testo    | Nome del modello                           | Sì           |
| year           | Numero   | Anno del modello                           | Sì           |
| type           | Testo    | Tipo ("car" o "motorcycle")                | Sì           |
| specifications | Oggetto  | Specifiche tecniche (formato libero)       | No           |
| vehicles       | Array    | Lista dei veicoli associati                | No           |

### Schema Veicolo

| Campo       | Tipo     | Descrizione                                           | Obbligatorio |
|-------------|----------|------------------------------------------------------|--------------|
| id          | Numero   | ID univoco (solo in esportazione)                     | No           |
| vin         | Testo    | Numero di telaio (VIN)                               | Sì           |
| licensePlate| Testo    | Targa del veicolo                                     | No           |
| color       | Testo    | Colore del veicolo                                    | Sì           |
| status      | Testo    | Stato ("available", "sold", "in_maintenance", "reserved") | No (default: "available") |
| condition   | Testo    | Condizione ("new", "used")                            | Sì           |
| mileage     | Numero   | Chilometraggio del veicolo                            | No (default: 0) |
| price       | Numero   | Prezzo di vendita                                     | Sì           |
| costPrice   | Numero   | Prezzo di costo (interno)                             | Sì           |
| description | Testo    | Descrizione del veicolo                               | No           |
| year        | Numero   | Anno di produzione                                    | Sì           |
| features    | Oggetto  | Caratteristiche del veicolo (formato libero)          | No           |
| images      | Array    | Lista di URL delle immagini                           | No           |
| createdAt   | Data     | Data di creazione (solo in esportazione)              | No           |

## API Disponibili

### Esportazione Catalogo

Questa API restituisce l'intero catalogo veicoli in formato gerarchico.

**Endpoint**: `GET /api/catalog/export`

**Risposta di Successo**:
- Codice: 200
- Formato: JSON
- Contenuto: Oggetto catalogo completo con marche, modelli e veicoli

**Esempio di Risposta**:
```json
{
  "makes": [
    {
      "id": 1,
      "name": "Ford",
      "type": "car",
      "logoUrl": "https://example.com/ford.png",
      "models": [
        {
          "id": 1,
          "name": "Mustang",
          "year": 2023,
          "type": "car",
          "specifications": {
            "engine": "V8",
            "power": "450hp"
          },
          "vehicles": [
            {
              "id": 1,
              "vin": "1FATP8UH3K5159596",
              "licensePlate": "AB123CD",
              "color": "Rosso",
              "status": "available",
              "condition": "new",
              "mileage": 0,
              "price": 59000,
              "costPrice": 55000,
              "description": "Nuova Ford Mustang GT",
              "year": 2023,
              "features": {
                "leather": true,
                "navigation": true
              },
              "images": [
                "https://example.com/mustang1.jpg",
                "https://example.com/mustang2.jpg"
              ],
              "createdAt": "2023-01-15T12:00:00Z"
            }
          ]
        }
      ]
    }
  ]
}
```

### Importazione Catalogo

Questa API consente di importare marche, modelli e veicoli in formato gerarchico.

**Endpoint**: `POST /api/catalog/import`

**Parametri**:
- Formato: JSON
- Contenuto: Oggetto catalogo con marche, modelli e veicoli

**Risposta di Successo**:
- Codice: 200
- Formato: JSON
- Contenuto: Riepilogo dell'importazione

**Esempio di Richiesta**:
```json
{
  "makes": [
    {
      "name": "Ferrari",
      "type": "car",
      "logoUrl": "https://example.com/ferrari.png",
      "models": [
        {
          "name": "F8 Tributo",
          "year": 2023,
          "type": "car",
          "specifications": {
            "engine": "V8 Twin-Turbo",
            "power": "720hp"
          },
          "vehicles": [
            {
              "vin": "ZFF92LMC000249185",
              "color": "Rosso Corsa",
              "condition": "new",
              "price": 329000,
              "costPrice": 310000,
              "description": "Ferrari F8 Tributo nuova",
              "year": 2023
            }
          ]
        }
      ]
    }
  ]
}
```

**Esempio di Risposta**:
```json
{
  "makesImported": 1,
  "modelsImported": 1,
  "vehiclesImported": 1,
  "message": "Importazione completata con successo"
}
```

## Esempi

### Esempio di Esportazione con cURL

```bash
curl -X GET http://localhost:3000/api/catalog/export
```

### Esempio di Importazione con cURL

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "makes": [
      {
        "name": "Lamborghini",
        "type": "car",
        "models": [
          {
            "name": "Huracán",
            "year": 2023,
            "type": "car",
            "vehicles": [
              {
                "vin": "ZHWES4ZF9NLA16341",
                "color": "Blu",
                "condition": "new",
                "price": 280000,
                "costPrice": 260000,
                "year": 2023
              }
            ]
          }
        ]
      }
    ]
  }' \
  http://localhost:3000/api/catalog/import
```

## Gestione Errori

Le API possono restituire i seguenti codici di errore:

| Codice | Descrizione                                                                                 |
|--------|---------------------------------------------------------------------------------------------|
| 400    | Errore nei dati di input (formato JSON non valido o validazione fallita)                    |
| 401    | Autenticazione fallita                                                                     |
| 403    | Accesso non autorizzato                                                                    |
| 500    | Errore interno del server                                                                  |

In caso di errore, la risposta avrà il seguente formato:

```json
{
  "message": "Descrizione dell'errore",
  "errors": [
    {
      "code": "codice_errore",
      "path": ["campo", "con", "errore"],
      "message": "Messaggio dettagliato dell'errore"
    }
  ]
}
```