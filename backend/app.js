const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db(process.env.DB_NAME);
const diagramsCollection = db.collection('diagrams');

// Save a new diagram
app.post('/api/diagrams', async (req, res) => {
    console.log(req.body);
    try {
        const result = await diagramsCollection.insertOne(req.body);
        console.log(result);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error saving diagram');
    }
});

// Get the latest diagram
app.get('/api/diagrams/latest', async (req, res) => {
    console.log(req.body);
    try {
        const diagram = await diagramsCollection
            .find()
            .sort({ lastModified: -1 })
            .limit(1)
            .toArray();
        res.json(diagram[0]);
    } catch (error) {
        res.status(500).send('Error loading diagram');
    }
});

// get by id
app.get('/api/diagrams/:id', async (req, res) => {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid ID format');
    }

    try {
        const diagram = await diagramsCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!diagram) {
            return res.status(404).send('Diagram not found');
        }

        res.json(diagram);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading diagram');
    }
});

// Create or Update an existing diagram
app.post('/api/diagrams/:id', async (req, res) => {
    console.log(req.body);
    try {
        const { id } = req.params;
        const updatedDiagram = await diagramsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body },
            { upsert: true }
        );
        console.log(updatedDiagram);
        res.status(200).send(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error updating diagram');
    }
});

app.listen(process.env.PORT, () => {
    console.log('Server running on port ' + process.env.PORT);
});
