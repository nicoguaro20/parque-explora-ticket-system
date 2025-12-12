const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const TABLE_NAME = process.env.TABLE_NAME;
const isOffline = process.env.IS_OFFLINE === "true";

let dynamoDbClientParams = {};

if (isOffline) {
  dynamoDbClientParams = {
    region: "localhost",
    endpoint: "http://localhost:8001",
    credentials: {
      accessKeyId: "dummy",
      secretAccessKey: "dummy",
    },
  };
}

const client = new DynamoDBClient(dynamoDbClientParams);
const dynamodb = DynamoDBDocumentClient.from(client);

// 🔐 Función para generar un ID encriptado de 10 caracteres
const encryptId10 = (id) => {
  return crypto
    .createHash("sha256")
    .update(id)
    .digest("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 10);
};

const createTicket = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (!body?.userId || !body?.title) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "userId and title are required" }),
      };
    }

    // Generar ticketId original
    const originalTicketId = crypto.randomUUID();

    // 🔐 Encriptar a 10 caracteres
    const secureTicketId = encryptId10(originalTicketId);

    const item = {
      pk: body.userId,
      sk: `TICKET#${secureTicketId}`,
      ticketId: secureTicketId,
      title: body.title,
      description: body.description || "",
      createdAt: new Date().toISOString()
    };

    await dynamodb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Ticket created", ticket: item }),
    };

  } catch (err) {
    console.error("Error creating ticket:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error", message: err.message }),
    };
  }
};

module.exports = { createTicket };
