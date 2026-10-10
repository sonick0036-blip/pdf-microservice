const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '10mb' }));

let browser;
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  }
  return browser;
}

app.post('/generate-pdf', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).send('Missing "html" string.');
    const b = await getBrowser();
    const page = await b.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'Letter', printBackground: true });
    await page.close();
    res.contentType('application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.toString());
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
