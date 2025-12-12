📄 README.md – Parque Explora Ticket System
# 🎟️ Parque Explora Ticket System  
Sistema completo para la gestión de tickets utilizando **Next.js (Frontend)** y **AWS Serverless (Backend con Lambda + API Gateway + DynamoDB)**.

Este proyecto implementa un flujo sencillo de autenticación y administración de tickets, ideal como base para un sistema de soporte, PQRS o solicitudes internas.

---

## 🚀 Tecnologías principales

### **Frontend**
- Next.js 14
- React
- TailwindCSS
- Fetch API

### **Backend**
- AWS Lambda
- Serverless Framework
- API Gateway (REST API)
- DynamoDB
- Node.js 18

---

## 🗂️ Arquitectura del proyecto



parque-explora-ticket-system/
│── front/ # Aplicación Next.js
│ ├── app/
│ ├── components/
│ ├── public/
│ ├── .env.local
│ └── package.json
│
│── back/ # Backend Serverless
│ ├── createTicket/
│ ├── createUser/
│ ├── getTicket/
│ ├── loginUser/
│ ├── updateTicket/
│ ├── serverless.yml
│ └── package.json
│
└── README.md


---

## 🧩 Funcionalidades

### ✔️ **Frontend**
- Formulario de login (email y password).
- Almacena userId en `localStorage`.
- Redirección al dashboard de tickets.
- UI simple y clara.

### ✔️ **Backend**
- Creación de usuario.
- Login con verificación en DynamoDB.
- Creación de tickets.
- Consulta de tickets de un usuario.
- Actualización de un ticket.
- Arquitectura escalable con particiones **pk/sk**.

---

## 🛠️ Cómo levantar el proyecto

---

# 🖥️ 1. Frontend (Next.js)

### 📌 Requisitos  
- Node.js 18+
- npm o yarn

### ▶️ Instalar dependencias
```bash
cd front
npm install

▶️ Variables de entorno

Crear el archivo front/.env.local:

NEXT_PUBLIC_API_URL=https://<api-id>.execute-api.us-east-2.amazonaws.com/dev

▶️ Ejecutar
npm run dev

🧩 2. Backend (Serverless + AWS)
📌 Requisitos

Node.js 18+

AWS CLI configurado

Serverless Framework instalado

▶️ Instalar dependencias
cd back
npm install

▶️ Desplegar en AWS
sls deploy


Esto creará:

Lambda Functions

API Gateway

DynamoDB Table

🗄️ Estructura de DynamoDB

La tabla usa keys compuestas:

Tipo de registro	pk	sk
Usuario	USER#uuid	METADATA
Lookup email	EMAIL#correo	LOOKUP
Ticket	TICKET#uuid	METADATA
Tickets por user	USER#uuid	TICKET#id

Esto permite:

Buscar userId por email.

Obtener todos los tickets de un usuario.

Escalar sin índices secundarios complejos.

📡 Endpoints (API Gateway)
Método	Ruta	Descripción
POST	/login	Login de usuario
POST	/user	Crear usuario
POST	/ticket	Crear ticket
GET	/users/{userId}/tickets	Obtener tickets
PATCH	/ticket/update/{id}	Actualizar ticket
🧪 Pruebas recomendadas

Puedes usar Postman o Thunder Client:

Crear usuario
POST /user
{
  "email": "test@mail.com",
  "password": "1234"
}

Login
POST /login
{
  "email": "test@mail.com",
  "password": "1234"
}

🎨 UI (Frontend)

Diseño minimalista con Tailwind

Formulario centrado

Estilo moderno y responsivo

🏁 Estado del proyecto

✔ Backend funcional vía Thunder Client
✔ Frontend totalmente conectado
⚠ Actualmente API Gateway requiere ajustes adicionales de CORS para funcionamiento total en navegador.

👨‍💻 Autor

Juan Nicolás García Guarín
Desarrollador | Analista Financiero

📬 Contacto

Si quieres mejorar el proyecto o tienes dudas, abre un Issue o Pull Request.


---

Si quieres, puedo añadir:

✅ Diagramas (arquitectura, flujo de login, DynamoDB)  
✅ Capturas de pantalla del frontend  
✅ GIF animado mostrando el flujo  
✅ Instrucciones para deploy en producción  

¿Quieres que le agregue algo más para que quede PERFECTO para entrega?
