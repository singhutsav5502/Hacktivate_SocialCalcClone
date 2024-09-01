# WebSocket Events Documentation

## Overview

This document outlines the WebSocket events used in the server code, describing how they handle various interactions between clients and the server. The WebSocket implementation is based on the `socket.io` library and is integrated into an Express HTTPS server.

## WebSocket Event Handlers

### 1. `connection`

**Description:**  
Triggered when a new client connects to the server.

**Handler:**  
- Logs the connection.
- Provides access to WebSocket methods and events (`socket`).

### 2. `joinSession`

**Description:**  
Emitted by clients to join a session. The server processes the user's information, updates the session, and sends the current session data back to the client.

**Client Payload:**
```json
{
  "sessionId": "string",
  "userId": "string",
  "username": "string",
  "email": "string"
}
```

# Server Handling

1. Fetches the user based on username and email.
2. Adds the user to the session if not already present.
3. Sends the complete session data back to the client.

# Server Emit

- **Event Name:** `sessionData`
- **Payload:**

```json
{
  "sessionId": "string",
  "rows": "number",
  "columns": "number",
  "sessionData": {
    "cellId": "cellValue"
  }
}
```

### 3. `addRow`

**Description:**  
Emitted by clients to add a new row to the session. The server updates the session with the new row and notifies all connected clients.

**Client Payload:**
```json
{
  "sessionId": "string",
  "senderId": "string"
}
```
## Server Handling:

* Increases the row count.
* Adds new cells to the session data.
* Emits updated session data to all clients in the session.

## Server Emit:

* Event Name: `sessionDataUpdated`
* Payload:

```json
{
  "sessionData": [
    ["cellId", "cellValue"]
  ],
  "rows": "number",
  "columns": "number",
  "senderId": "string"
}
```

### 4. `addColumn`

**Description:**  
Emitted by clients to add a new column to the session. The server updates the session with the new column and notifies all connected clients.

**Client Payload:**
```json
{
  "sessionId": "string",
  "senderId": "string"
}
```
## Server Handling

1. Increases the column count.
2. Adds new cells to the session data.
3. Emits updated session data to all clients in the session.

## Server Emit

**Event Name:** `sessionDataUpdated`

**Payload:**

```json
{
  "sessionData": [
    ["cellId", "cellValue"]
  ],
  "rows": "number",
  "columns": "number",
  "senderId": "string"
}
```

### 5. `focusCell`

**Description**
Emitted by clients when a cell is focused. The server broadcasts this event to all clients in the same session.

**Client Payload:**
```json
{
  "sessionId": "string",
  "cellId": "string",
  "username": "string"
}
```
### Server Emit

**Event Name:** `cellFocused`

**Payload:**

```json
{
  "cellId": "string",
  "username": "string"
}
```

### 6. `unfocusCell`

**Description:**  
Emitted by clients when a cell is unfocused. The server broadcasts this event to all clients in the same session.

**Client Payload:**
```json
{
  "sessionId": "string",
  "cellId": "string",
  "username": "string"
}
```

### Server Emit

**Event Name:** `cellUnfocused`

**Payload:**

```json
{
  "cellId": "string",
  "username": "string"
}
```

### 7. disconnect
**Description:**
Triggered when a client disconnects from the server.

**Server Handling:**
Logs the disconnection.

### 8. `createUser`

**Description:**  
Emitted by clients to create a new user. The server checks for existing users and creates a new user if none is found.

**Client Payload:**
```json
{
  "username": "string",
  "email": "string"
}
```

### Server Handling

- Checks if the user already exists.
- Creates a new user if necessary.
- Sends the created user data back to the client.

### Server Emit

**Event Name:** `userCreated`

**Payload:**

```json
{
  "userId": "string",
  "username": "string",
  "email": "string"
}
```
### Error Handling

**Event Name:** `error`

**Description:** Emitted by the server in case of errors during various operations, such as user creation.

**Payload:**

```json
{
  "message": "string"
}
```