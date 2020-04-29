let fs = require('fs');
let http = require('http');
let path = require('path');
let srcPath = path.join(__dirname, 'src');
fs.readdir(srcPath, function(err, files) {
  if (!err)
    files.forEach(fileName => {
      let port = fileName;
      http
        .createServer(async function(req, res) {
          if (req.url === '/') {
            req.url = '/index.html';
          }
          let htmlPath = path.join(srcPath, port, req.url);
          fs.readFile(htmlPath, function(err, data) {
            if (err) {
              res.writeHead(404);
              res.end(JSON.stringify(err));
              return;
            }
            res.writeHead(200);
            res.end(data);
          });
        })
        .listen(port);
    });
});
