const express = require('express');
const fs = require('fs');
const path = require('path');
const m3u8Parser = require('m3u8-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Static files (HTML, CSS, JS) served from public folder
app.use(express.static(path.join(__dirname, 'public')));

const m3uFilePath = './test.m3u';  // Path to your M3U file
let channels = [];

// M3U file parsing function
function parseM3U() {
  const fileContent = fs.readFileSync(m3uFilePath, 'utf-8');
  const parser = new m3u8Parser.Parser();
  parser.push(fileContent);
  parser.end();

  channels = [];

  // Iterate through each line to extract channel data
  fileContent.split('\n').forEach((line, index, arr) => {
    if (line.startsWith('#EXTINF')) {
      const titleMatch = line.match(/,([^\n]+)/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);

      const title = titleMatch ? titleMatch[1] : 'No Title';
      const logo = logoMatch ? logoMatch[1] : '';
      const group = groupMatch ? groupMatch[1] : 'Uncategorized';
      const tvgId = idMatch ? idMatch[1] : '';

      // URL comes after the #EXTINF line
      const url = arr[index + 1] && arr[index + 1].trim();

      if (url && url.startsWith('http')) {
        channels.push({
          "group-title": group,
          "tvg-id": tvgId,
          "tvg-logo": logo,
          "title": title,
          "url": url
        });
      }
    }
  });
}

// API: Return the channel list
app.get('/channels', (req, res) => {
  res.json(channels);
});

// Server start
app.listen(PORT, () => {
  parseM3U();  // Parse M3U file on server startup
  console.log(`Server running on port ${PORT}`);
});
