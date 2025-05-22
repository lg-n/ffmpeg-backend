const express = require('express');
const app = express();
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

app.use(express.json());

// This is the important part:
app.post('/combine', async (req, res) => {
    const { image, audio } = req.body;
    
    // Download image
    const imagePath = path.join(__dirname, 'input.jpg');
    const imgRes = await axios.get(image, { responseType: 'stream' });
    imgRes.data.pipe(fs.createWriteStream(imagePath));

    // Wait for image to finish downloading
    await new Promise((resolve, reject) => {
        imgRes.data.on('end', resolve);
        imgRes.data.on('error', reject);
    });

    // Same for audio...

    // Run FFmpeg and send back result
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
