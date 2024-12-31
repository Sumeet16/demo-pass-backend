const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000 || process.env.PORT;

// Middleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "*"],
    methods: ["GET", "POST"],
    credentials: true
}))
require('dotenv').config();
app.use(express.json());


const mongoURI = `mongodb+srv://admin:admin@cluster0.6rujm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Atlas Connected"))
    .catch(err => console.error(err));

// Schema and Model
const colorSchema = new mongoose.Schema({
    color: { type: String, required: true },
});
const Color = mongoose.model("Color", colorSchema);

// API to get the current color
app.get("/api/color", async (req, res) => {
    try {
        const currentColor = await Color.findOne();
        if (!currentColor) {
            return res.status(404).send({ message: "No color set yet" });
        }
        res.status(200).json({ color: currentColor.color });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// API to update the color
app.post("/api/color", async (req, res) => {
    try {
        const { color } = req.body;
        if (!color || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
            return res.status(400).send({ message: "Invalid color code" });
        }
        let currentColor = await Color.findOne();
        if (currentColor) {
            currentColor.color = color;
            await currentColor.save();
        } else {
            currentColor = new Color({ color });
            await currentColor.save();
        }
        res.status(200).json({ message: "Color updated", color: currentColor.color });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// setting up an empty GET Route
app.get('/', (req, res) => { res.json({ message: "You've come to the right place... it's a GET request!!" }) });

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
