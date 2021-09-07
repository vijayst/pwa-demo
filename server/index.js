const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/hospitals', (req, res) => {
    const text = fs.readFileSync('hospitals.json');
    const hospitals = JSON.parse(text);
    res.json(hospitals);
});

app.listen(5000, () => {
    console.log('Listening on port 5000');
});
