# Evidencias de pruebas (Postman)

Este documento reúne las capturas de las pruebas realizadas con Postman para los endpoints del proyecto.

> Coloca las imágenes en `docs/images/` con los nombres indicados para que se vean aquí automáticamente.

---

## 1. Crear usuario (POST)

- Endpoint: `http://localhost:3000/api/users`
- Cuerpo de ejemplo:

```json
{
  "name": "Ana López",
  "email": "ana.lopez@example.com",
  "role": "ANALYST"
}
```

Resultado esperado: `201 Created` con el objeto del usuario creado.

![Postman - Crear usuario](images/postman-create-user.png)

---

## 2. Listar usuarios (GET)

- Endpoint: `http://localhost:3000/api/users`
- Resultado esperado: `200 OK` con arreglo de usuarios.

![Postman - Listar usuarios](images/postman-list-users.png)

---

## 3. Obtener usuario por id (GET)

- Endpoint: `http://localhost:3000/api/users/{id}`
- Resultado esperado: `200 OK` con el objeto del usuario.

![Postman - Obtener usuario por id](images/postman-get-user.png)

---

## 4. Crear reporte (POST)

- Endpoint: `http://localhost:3000/api/reports`
- Cuerpo de ejemplo:

- Endpoint: `http://localhost:3000/api/reports`
- Cuerpo de ejemplo:

```json
{
  "userId": "80170f33-2da3-479a-a84d-fafcb34a55ff",
  "assignedToId": "fc50e2c6-f1fa-44db-8daa-5315960edf5f",
  "title": "Alerta SQL Injection",
  "description": "Se detectó posible inyección en /login",
  "priority": "HIGH"
}
```

Resultado esperado: `201 Created` con el reporte creado.

![Postman - Crear reporte](images/postman-report-create-exito.png)

---

## 5. Listar reportes (GET)

- Endpoint: `http://localhost:3000/api/reports`
- Resultado esperado: `200 OK` con arreglo de reportes.

- Endpoint: `http://localhost:3000/api/reports`
- Resultado esperado: `200 OK` con arreglo de reportes.

![Postman - Listar reportes](images/postman-report-list-exito.png)

---

## 6. Listar reportes activos (GET)

- Endpoint: `http://localhost:3000/api/reports/active`
- Resultado esperado: `200 OK` con reportes en estados `IN_REVIEW` o `IN_PROGRESS`.

![Postman - Reportes activos](images/postman-report-active.png)

---

## 7. Obtener reporte por id (GET)

- Endpoint: `http://localhost:3000/api/reports/{id}`
- Resultado esperado: `200 OK` con el objeto del reporte.

- Endpoint: `http://localhost:3000/api/reports/{id}`
- Resultado esperado: `200 OK` con el objeto del reporte.

![Postman - Obtener reporte por id](images/postman-report-get-exito.png)

---

## 8. Actualizar reporte (PATCH)

- Endpoint: `http://localhost:3000/api/reports/{id}`
- Cuerpo de ejemplo:

```json
{
  "title": "Alerta SQLi actualizada",
  "priority": "URGENT",
  "status": "IN_PROGRESS"
}
```

Resultado esperado: `200 OK` con el objeto actualizado.

![Postman - Actualizar reporte](images/postman-report-update.png)

---

## 9. Completar reporte (PATCH findings)

- Endpoint: `http://localhost:3000/api/reports/{id}/complete`
- Cuerpo de ejemplo:

```json
{
  "findings": "No se reprodujo el vector. Se aplicó validación parametrizada."
}
```

Resultado esperado: `200 OK` con el reporte en `COMPLETED`.

![Postman - Completar reporte](images/postman-report-complete.png)

---

## 10. Eliminar reporte (DELETE)

- Endpoint: `http://localhost:3000/api/reports/{id}`
- Resultado esperado: `200 OK` con `success: true`.

![Postman - Eliminar reporte](images/postman-report-delete.png)

---

## Notas

- Si alguna captura no se visualiza, verifica que el archivo exista en `docs/images/` con el nombre correcto.
- Nombres sugeridos:
  - `postman-create-user.png`
  - `postman-list-users.png`
  - `postman-get-user.png`
  - `postman-report-create-exito.png`
  - `postman-report-list-exito.png`
  - `postman-report-get-exito.png`
