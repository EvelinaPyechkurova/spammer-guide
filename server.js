require("dotenv").config();
const cors = require('cors');

const express = require("express");
const { connectToDb, getDb } = require("./db/db");
const addressRoutes = require("./routes/addresses");
const textsRoutes = require("./routes/texts");
const emailRoutes = require("./routes/emailRoutes");

const server = express();
const PORT = 3000;

server.use(cors());
server.use(express.json());

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