const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

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

const updateTicket = async (event) => {
  try {
    const ticketId = event.pathParameters?.id;
    const body = JSON.parse(event.body);

    if (!ticketId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Ticket ID is required" }),
      };
    }

    const sk = `TICKET#${ticketId}`;

    // 1️⃣ Buscar el ticket para obtener su PK (USER#email)
    const query = await dynamodb.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "sk-index", // si tienes GSI, si no la agrego abajo
      KeyConditionExpression: "sk = :sk",
      ExpressionAttributeValues: {
        ":sk": sk
      }
    }));

    if (query.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Ticket not found" }),
      };
    }

    const ticket = query.Items[0];

    // 2️⃣ Construir dinámicamente el UPDATE
    let updateExp = [];
    let expAttrNames = {};
    let expAttrValues = {};

    for (const key in body) {
      updateExp.push(`#${key} = :${key}`);
      expAttrNames[`#${key}`] = key;
      expAttrValues[`:${key}`] = body[key];
    }

    const params = {
      TableName: TABLE_NAME,
      Key: {
        pk: ticket.pk,
        sk: ticket.sk
      },
      UpdateExpression: `SET ${updateExp.join(", ")}`,
      ExpressionAttributeNames: expAttrNames,
      ExpressionAttributeValues: expAttrValues,
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamodb.send(new UpdateCommand(params));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket: result.Attributes }),
    };

  } catch (error) {
    console.error("Error updating ticket:", error);

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

module.exports = { updateTicket };