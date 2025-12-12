const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const TABLE_NAME = process.env.TABLE_NAME;

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

// 🔥 CORS headers (OBLIGATORIOS)
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*"
};

exports.loginUser = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Lookup by email
    const lookup = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `EMAIL#${normalizedEmail}`,
          sk: "LOOKUP",
        },
      })
    );

    if (!lookup.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const userId = lookup.Item.userId;

    // 2. Get real user
    const user = await dynamodb.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: `USER#${userId}`,
          sk: "METADATA",
        },
      })
    );

    if (!user.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    if (user.Item.password !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Invalid credentials" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Login successful",
        userId,
      }),
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
