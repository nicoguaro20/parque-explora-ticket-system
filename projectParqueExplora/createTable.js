const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB({
  region: "localhost",
  endpoint: "http://localhost:8001",
  accessKeyId: "dummy",
  secretAccessKey: "dummy",
});

const params = {
  TableName: "crud-serverless-ticket-dev-tickets", // ✅ Nombre corregido
  KeySchema: [
    { AttributeName: "pk", KeyType: "HASH" }       // ✅ Clave primaria
  ],
  AttributeDefinitions: [
    { AttributeName: "pk", AttributeType: "S" }    // ✅ Tipo string
  ],
  BillingMode: "PAY_PER_REQUEST"
};

dynamodb.createTable(params, (err, data) => {
  if (err) {
    console.error("Error creating table:", err);
  } else {
    console.log("Table created successfully:", data);
  }
});
