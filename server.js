const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve HTML file

app.post('/save', (req, res) => {
    const text = req.body.text;
    const filePath = path.join(__dirname, 'transcript.txt');

    fs.appendFile(filePath, text + '\n', (err) => {
        if (err) {
            console.error('Error saving file:', err);
            return res.status(500).send('Error saving transcript');
        }
        console.log('Transcript saved:', text);
        res.send('Transcript saved!');
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});