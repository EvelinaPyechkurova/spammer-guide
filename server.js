/*
1) button to select all addresses
2) formalize error throwing and console logging
3) create new address now appears after pressing button
4) can delete many selected addresses
6) text appears in template, with subject
7) use shablonizers
*/

require("dotenv").config();
const cors = require('cors');

const express = require("express");
const { connectToDb, getDb } = require("./db/db");
const addressRoutes = require("./routes/addressesRoutes");
const textsRoutes = require("./routes/textsRoutes");
const emailRoutes = require("./routes/emailRoutes");

const swaggerJSDocs = require("swagger-jsdoc");
const swaggerUi = require('swagger-ui-express');

// defines root information for API
const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "Express API for Spammer's Guide",
        version: "1.0.0",
        description: "This is a REST API application made with Express. It allows users to send emails woth specified text to specified list of addresses.",
        license: {
            name: 'Licensed Under MIT',
            url: 'https://spdx.org/licenses/MIT.html',
        },
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Development server"
        }
    ]
};

// used by swagger-jsdoc to produce an OpenAPI specification
const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ["./routes/*.js"]
};

// This specification is equivalent to the swagger.json or swagger.yaml 
// file normally used by Swagger UI to create a docs page.
const swaggerSpec = swaggerJSDocs(options);

const server = express();
const PORT = 3000;

server.use(cors());
server.use(express.json());
/*provides two callbacks to set up the endpoint: 
 one to set up Swagger UI with the swaggerSpec definitions
 and one to serve it to the /docs endpoint. */
server.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function dbConnectionCheck(req, res, next){
    try{
        getDb();
        next();
    }catch{
        res.status(500).json({ error: "Database connection not available. Please try again later." });
    }
}

server.use(dbConnectionCheck);

server.use("/addresses", addressRoutes);
server.use("/texts", textsRoutes);
server.use("/emails", emailRoutes);

connectToDb((error) => {
    if(!error){
        server.listen(PORT, () => {
            console.log("Server listening on port", PORT);
        });
        db = getDb();
    }else{
        console.log("Error while connecting to database:", error);
    }
});

server.set("view engine", "twig");
server.set("views", ".");

async function fetchTexts() {
    try {
        const url = "http://localhost:3000/texts/";
        const response = await fetch(url);
        if (!response.ok) 
            throw new Error(`Failed to fetch texts: ${response.statusText}`);
        const texts = await response.json();
        return texts;
        //renderTexts(texts);
    } catch (error) {
        console.error("Error fetching texts:", error);
    }
}

async function fetchAddresses(){
    try{
        const url = "http://localhost:3000/addresses/";
        const responce = await fetch(url);
        if(!responce.ok)
            throw new Error(`Failed to fetch addresses: ${responce.statusText}`);
        const addresses = await responce.json();
        return addresses;
        //renderAddresses(addresses);
    } catch (error) {
        console.error("Error fetching addresses:", error);
    }
}

server.use("/", async (req, res) => {
    try{
        const [addresses, texts] = await Promise.all([fetchAddresses(), fetchTexts()]);
        res.render(__dirname+"/public/index.twig", { addresses, texts });
    }catch(error){
        console.error("Error rendering page:", error);
        res.status(500).send("Internal Server Error");
    }
});