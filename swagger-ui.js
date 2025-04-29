import fs from "fs";
import express from "express";
import swaggerUi from "swagger-ui-express";

// Read the Swagger JSON file
const swaggerDocument = JSON.parse(fs.readFileSync("./swagger.json", "utf8"));

// Create an Express app
const app = express();
const port = 3000;

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Redirect root to Swagger UI
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Start the server
app.listen(port, () => {
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});

console.log("Swagger documentation server started!");
console.log("To use this with your atlas-files_manager project:");
console.log("1. Copy the swagger.json file to your project root");
console.log(
  "2. Install required packages: npm install express swagger-ui-express"
);
console.log("3. Run this script to view the API documentation");
