/* Simple Express proxy server for Serper API
   - Reads SERPER_API_KEY from environment
   - POST /api/search { query, num }
   - Forwards to Serper and returns JSON
*/

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SERPER_API_KEY = process.env.SERPER_API_KEY;
if (!SERPER_API_KEY) {
  console.warn('Warning: SERPER_API_KEY not set. /api/search will return an error.');
}

app.post('/api/search', async (req, res) => {
  if (!SERPER_API_KEY) return res.status(500).json({ error: 'SERPER_API_KEY not configured on server.' });
  const { query, num = 5 } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Missing query' });

  try {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=${encodeURIComponent(num)}`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${SERPER_API_KEY}` } });
    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(resp.status).json({ error: txt });
    }
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API proxy running on http://localhost:${port}`));
