/*
1) button to select all addresses
2) formalize error throwing and console logging
3) create new address now appears after pressing button
4) can delete many selected addresses
6) text appears in template, with subject
*/

require("dotenv").config();

const cors = require('cors');
const express = require("express");
const { connectToDb, getDb } = require("./db/db");
const addressRoutes = require("./routes/addressesRoutes");
const textsRoutes = require("./routes/textsRoutes");
const emailRoutes = require("./routes/emailRoutes");

const server = express();
const PORT = 3000;

server.use(cors());
server.use(express.json());

// Connect to database and run server
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

// Middleware to check if database connection exists
function dbConnectionCheck(_req, res, next){
    try{
        getDb();
        next();
    }catch{
        res.status(500).json({ error: "Database connection not available. Please try again later." });
    }
}

server.use(dbConnectionCheck);

// Register route handlers for different API endpoints
server.use("/texts", textsRoutes);
server.use("/addresses", addressRoutes);
server.use("/emails", emailRoutes);

// Configure view engine and where to look for template files
server.set("view engine", "twig");
server.set("views", __dirname+"/public");

server.use(express.static(__dirname+"/public"));

// Fetch all text messages
async function fetchTexts() {
    try {
        const url = "http://localhost:3000/texts/";
        const response = await fetch(url);
        if (!response.ok) 
            throw new Error(`Failed to fetch texts: ${response.statusText}`);
        const texts = await response.json();
        return texts;
    } catch (error) {
        console.error("Error fetching texts:", error);
    }
}

// Fetch all addressess
async function fetchAddresses(){
    try{
        const url = "http://localhost:3000/addresses/";
        const responce = await fetch(url);
        if(!responce.ok)
            throw new Error(`Failed to fetch addresses: ${responce.statusText}`);
        const addresses = await responce.json();
        return addresses;
    } catch (error) {
        console.error("Error fetching addresses:", error);
    }
}

// Register handler for root endpoint
server.use("/", async (req, res) => {
    try{
        const [addresses, texts] = await Promise.all([fetchAddresses(), fetchTexts()]);
        res.render(__dirname+"/public/index.twig", { addresses, texts });
    }catch(error){
        console.error("Error rendering page:", error);
        res.status(500).send("Internal Server Error");
    }
});