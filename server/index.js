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

app.post('/hospital/:id', (req, res) => {
    const { id } = req.params;
    const text = fs.readFileSync('hospitals.json');
    const hospitals = JSON.parse(text);
    const hospital = hospitals.find((h) => h.id === id);
    if (hospital) {
        hospital.specialities = req.body.specialities;
        hospital.doctors = req.body.doctors;
        hospital.surgeries = req.body.surgeries;
        hospital.bedCount = req.body.bedCount;
        const hospitalsText = JSON.stringify(hospitals);
        fs.writeFileSync('hospitals.json', hospitalsText);
        return res.send({ message: 'ok' });
    }
    res.status(500).send({ message: 'Incorrect hospital detail' });
});

app.listen(4000, () => {
    console.log('Listening on port 4000');
});
