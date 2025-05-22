const express = require('express');
const app = express();
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

app.use(express.json());

app.post('/combine', async (req, res) => {
    const { image, audio } = req.body;

    const imagePath = path.join(__dirname, 'input.jpg');
    const audioPath = path.join(__dirname, 'input.mp3');
    const outputPath = path.join(__dirname, 'output.mp4');

    try {
        // Download image
        const imgRes = await axios.get(image, { responseType: 'stream' });
        imgRes.data.pipe(fs.createWriteStream(imagePath));

        await new Promise((resolve, reject) => {
            imgRes.data.on('end', resolve);
            imgRes.data.on('error', reject);
        });

        // Download audio
        const audRes = await axios.get(audio, { responseType: 'stream' });
        audRes.data.pipe(fs.createWriteStream(audioPath));

        await new Promise((resolve, reject) => {
            audRes.data.on('end', resolve);
            audRes.data.on('error', reject);
        });

        // Run FFmpeg
        exec(`ffmpeg -loop 1 -i ${imagePath} -i ${audioPath} -c:v libx264 -tune stillimage -c:a aac -pix_fmt yuv420p -shortest ${outputPath}`, async (err) => {
            if (err) return res.status(500).send("FFmpeg error");

            // Upload output
            const uploadRes = await axios.post('https://file.io ', fs.createReadStream(outputPath), {
                headers: { 'Content-Type': 'video/mp4' }
            });

            fs.unlinkSync(imagePath);
            fs.unlinkSync(audioPath);
            fs.unlinkSync(outputPath);

            res.json({ url: uploadRes.data.link });
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error downloading media");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
