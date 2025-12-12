const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, QueryCommand } = require("@aws-sdk/lib-dynamodb");

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

const getTicket = async (event) => {
  try {
    const rawUserId = event.pathParameters?.userId;

    if (!rawUserId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    // 👉 Convertimos el UUID a pk correcto
    const pk = `USER#${rawUserId.trim()}`;

    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": pk,
      },
    };

    const result = await dynamodb.send(new QueryCommand(params));

    // 👉 Solo devolvemos los SK que pertenezcan a tickets
    const tickets =
      result.Items?.filter((item) => item.sk?.startsWith("TICKET#")) ?? [];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tickets }),
    };
  } catch (error) {
    console.error("Error getting tickets:", error);
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

module.exports = { getTicket };


