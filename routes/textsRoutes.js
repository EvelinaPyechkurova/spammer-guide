const express = require("express");
const router = express.Router();
const {getDb} = require("../db/db");
const invalidText = require("../validation/textValidation");
const { ObjectId } = require("mongodb");

/**
 * @swagger
 * /texts/:
 *   get:
 *     summary: Retrieve a list of predefined text messages from database
 *     description: Retrieve a list of predefined text messages from database. Used to populate a list of text templates when running a program.
 *     responses:
 *       200:
 *         description: A list of predefined text messages.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 texts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: The ID of the text message
 *                         example: 507f1f77bcf86cd799439011
 *                       text:
 *                         type: string
 *                         description: Text message content.
 *                         example: You've been selected for a special opportunity to delete this email immediately!
 *       500:
 *         description: Error while getting texts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   description: The error message
 *                   example: "Could not get texts"
 *                 "Error message":
 *                   type: string
 *                   description: Detailed error message
 *                   example: "Database connection failed"
 */
router.get("/", (req, res) => {
    const db = getDb();
    let texts = [];

    db.collection("texts")
    .find({})
    .sort({text: 1})
    .forEach(text => texts.push(text))
    .then(() => {
        res.status(200).json(texts);
    })
    .catch((error) => {
        res.status(500).json({"Error": "Could not get texts", "Error message": error});
    });
});

/**
 * @swagger
 * /texts/{id}:
 *   get:
 *     summary: Retrieve a single predefined text message with specified id.
 *     description: Retrieve a single predefined text message with specified id from database. Used to select single text.
 *     responses:
 *       200:
 *         description: A single predefined text message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the text message
 *                   example: 507f1f77bcf86cd799439011
 *                 text:
 *                   type: string
 *                   description: Text message content.
 *                   example: You've been selected for a special opportunity to delete this email immediately!
 *       500:
 *         description: Error while getting texts.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Error:
 *                   type: string
 *                   description: The error message
 *                   example: "Could not get texts"
 *                 "Error message":
 *                   type: string
 *                   description: Detailed error message
 *                   example: "Database connection failed"
 */
router.get("/:id", (req, res) => {
    const db = getDb();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) 
        return res.status(400).json({ error: "Invalid ID format" });

    db.collection("texts")
    .findOne({_id : new ObjectId(id)})
    .then((text) => {
        if(!text)
            return res.status(404).json({error: "text not found"});
        res.status(200).json(text);
    })
    .catch((error) => {
        res.status(500).json({"Error": "Could not get text by id", "Error message": error});
    });;
});

// create new text
router.post("/", (req, res) => {
    const db = getDb();
    const text = req.body;

    const invalid = invalidText(text);
    
    if(invalid)
        return res.status(400).json(invalid);

    db.collection("texts")
    .insertOne(text)
    .then((result) => {
        res.status(201).json({"message": "text was added successfully", "insertedId": result.insertedId});
    })
    .catch((error) => {
        res.status(500).json({"Error": "Could not add text", "Error message": error});
    });
});

module.exports = router;