const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'gallery-data.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/api/gallery', (req, res) => {
  fs.readFile(DATA_FILE, 'utf-8', (err, fileContents) => {
    if (err) {
      console.error('Failed to read gallery data:', err);
      return res.status(500).json({ error: 'Unable to read gallery data' });
    }

    try {
      const data = JSON.parse(fileContents);
      return res.json(data);
    } catch (parseError) {
      console.error('Failed to parse gallery data:', parseError);
      return res.status(500).json({ error: 'Invalid gallery data format' });
    }
  });
});

app.post('/api/gallery', (req, res) => {
  const categories = req.body.categories;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Invalid payload. Expected { categories: [...] }.' });
  }

  const payload = JSON.stringify({ categories }, null, 2);
  fs.writeFile(DATA_FILE, payload, 'utf-8', (err) => {
    if (err) {
      console.error('Failed to save gallery data:', err);
      return res.status(500).json({ error: 'Unable to save gallery data' });
    }
    return res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
