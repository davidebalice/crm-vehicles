# Vehicle Catalog API Documentation

This documentation describes the available APIs for integrating the vehicle catalog with external systems.

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Data Format](#data-format)
4. [Available APIs](#available-apis)
    - [Catalog Export](#catalog-export)
    - [Catalog Import](#catalog-import)
5. [Examples](#examples)
6. [Error Handling](#error-handling)

## Introduction

The dealership management system offers APIs for importing and exporting the complete vehicle catalog, including hierarchies of makes, models, and specific vehicles. These APIs are designed to allow integration with websites, applications, and other management systems.

## Authentication

All API requests require authentication. Currently, the system uses a simple authentication for MVP purposes, but in production, a JWT or API key-based authentication system will be implemented.

## Data Format

The APIs use JSON as the data interchange format. The hierarchical structure of the catalog is as follows:

```
Catalog
  └── Makes (Ford, Fiat, etc.)
       └── Models (Mustang, 500, etc.)
            └── Vehicles (specific instances)
```

### Make Schema

| Field      | Type     | Description                                  | Required |
|------------|----------|----------------------------------------------|----------|
| id         | Number   | Unique ID (in export only)                   | No       |
| name       | Text     | Make name                                    | Yes      |
| type       | Text     | Type ("car" or "motorcycle")                 | Yes      |
| logoUrl    | URL      | URL of the make's logo                       | No       |
| models     | Array    | List of associated models                    | No       |

### Model Schema

| Field          | Type     | Description                                | Required |
|----------------|----------|-------------------------------------------|----------|
| id             | Number   | Unique ID (in export only)                 | No       |
| name           | Text     | Model name                                 | Yes      |
| year           | Number   | Model year                                 | Yes      |
| type           | Text     | Type ("car" or "motorcycle")               | Yes      |
| specifications | Object   | Technical specifications (free format)     | No       |
| vehicles       | Array    | List of associated vehicles                | No       |

### Vehicle Schema

| Field       | Type     | Description                                           | Required |
|-------------|----------|------------------------------------------------------|----------|
| id          | Number   | Unique ID (in export only)                            | No       |
| vin         | Text     | Vehicle Identification Number (VIN)                   | Yes      |
| licensePlate| Text     | Vehicle license plate                                 | No       |
| color       | Text     | Vehicle color                                         | Yes      |
| status      | Text     | Status ("available", "sold", "in_maintenance", "reserved") | No (default: "available") |
| condition   | Text     | Condition ("new", "used")                             | Yes      |
| mileage     | Number   | Vehicle mileage                                       | No (default: 0) |
| price       | Number   | Selling price                                         | Yes      |
| costPrice   | Number   | Cost price (internal)                                 | Yes      |
| description | Text     | Vehicle description                                   | No       |
| year        | Number   | Year of production                                    | Yes      |
| features    | Object   | Vehicle features (free format)                        | No       |
| images      | Array    | List of image URLs                                    | No       |
| createdAt   | Date     | Creation date (in export only)                        | No       |

## Available APIs

### Catalog Export

This API returns the entire vehicle catalog in a hierarchical format.

**Endpoint**: `GET /api/catalog/export`

**Success Response**:
- Code: 200
- Format: JSON
- Content: Complete catalog object with makes, models, and vehicles

**Response Example**:
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
              "color": "Red",
              "status": "available",
              "condition": "new",
              "mileage": 0,
              "price": 59000,
              "costPrice": 55000,
              "description": "New Ford Mustang GT",
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

### Catalog Import

This API allows importing makes, models, and vehicles in a hierarchical format.

**Endpoint**: `POST /api/catalog/import`

**Parameters**:
- Format: JSON
- Content: Catalog object with makes, models, and vehicles

**Success Response**:
- Code: 200
- Format: JSON
- Content: Import summary

**Request Example**:
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
              "description": "New Ferrari F8 Tributo",
              "year": 2023
            }
          ]
        }
      ]
    }
  ]
}
```

**Response Example**:
```json
{
  "makesImported": 1,
  "modelsImported": 1,
  "vehiclesImported": 1,
  "message": "Import completed successfully"
}
```

## Examples

### Export Example with cURL

```bash
curl -X GET http://localhost:3000/api/catalog/export
```

### Import Example with cURL

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
                "color": "Blue",
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

## Error Handling

The APIs can return the following error codes:

| Code | Description                                                                               |
|------|-------------------------------------------------------------------------------------------|
| 400  | Input data error (invalid JSON format or validation failed)                               |
| 401  | Authentication failed                                                                     |
| 403  | Unauthorized access                                                                       |
| 500  | Internal server error                                                                     |

In case of an error, the response will have the following format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "code": "error_code",
      "path": ["field", "with", "error"],
      "message": "Detailed error message"
    }
  ]
}
```