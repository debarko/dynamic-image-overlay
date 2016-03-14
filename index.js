if (process.argv.length <= 2) {
    console.log(chalk.red("Resize required."));
    process.exit(-1);
}
var watermark = require('image-watermark');
var http = require('http');
var router = require('./router');
var url = require('url');
var fs = require('fs');
var request = require('request');
var crypto = require('crypto');
var resize = process.argv[2];

function magick(fileName, text,  res) {
    watermark.embedWatermarkWithCb(fileName, {
        'text': text || 'sample watermark',
        'color' : 'rgb(255, 255, 255)',
        'override-image' : 'true',
        'resize' : resize,
        'align': 'ltr'
    }, function(err) {
        if (!err) {
            fs.readFile(fileName, function(err, data) {
                if (!err) {
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    res.end(data);
                    fs.unlink(fileName);
                }
            })
        }
    });
}

router.register('/', function(req, res) {
    var queryData = url.parse(req.url, true).query,
        fileName = "tmp" + crypto.randomBytes(4).readUInt32LE(0) + "x.jpg";

    var file = fs.createWriteStream(fileName);
    http.get(queryData.image, function(response) {
        response.pipe(file).on('close', function() {
            magick(fileName, queryData.text, res);
        });
    });
});

var server = http.createServer(function(req, res) {
    handler = router.route(req);
    handler.process(req, res);
});

// Start it up
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8000 ;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1' ;
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", server_port " + server_port );
});


//server.listen(8000);