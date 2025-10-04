// Production server for Electron app
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = false;
const hostname = 'localhost';
const port = 3002;

// When packaged, the app directory will be different
const dir = path.join(__dirname);
const app = next({ dev, hostname, port, dir });
const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
}

module.exports = { startServer };