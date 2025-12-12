const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { randomUUID } = require("crypto");

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

const createUser = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Body is required" }),
      };
    }

    const body = JSON.parse(event.body);
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "email and password are required" }),
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 🔍 Verificar si ya existe un usuario con ese email (secondary lookup)
    const existingCheck = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `EMAIL#${normalizedEmail}`,
          sk: "LOOKUP",
        },
      })
    );

    if (existingCheck.Item) {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "User already exists" }),
      };
    }

    // 🆕 Crear nuevo UUID
    const userId = randomUUID();
    const pk = `USER#${userId}`;
    const sk = "METADATA";

    const userItem = {
      pk,
      sk,
      userId,
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      entityType: "USER",
    };

    // Guardar usuario
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: userItem,
      })
    );

    // Guardar lookup para verificar email en el futuro
    await dynamodb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: `EMAIL#${normalizedEmail}`,
          sk: "LOOKUP",
          userId,
        },
      })
    );

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "User created",
        userId, // <-- UUID limpio
      }),
    };

  } catch (error) {
    console.error("Error creating user:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

module.exports = { createUser };
