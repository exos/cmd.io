var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , path = require('path')
  , cmdio = require('../..');

app.listen(3000);

console.log(cmdio);

function handler (request, response) {

    var filePath = __dirname + '/public/' + request.url;
    
    if (request.url == '/')
        filePath = __dirname + '/public/index.html';
    
    if (request.url == '/cmdio.js')
        filePath = __dirname + '/../../lib/cmdio.js';
        
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(403);
                    response.end("No index file");
                    console.log('No index in ' + filePath);
                }
                else {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end(request.url + ' not found');
        }
    });

}

var Products = require('./orders');
var ProductsInterface = new Products();


io.sockets.on('connection', function (socket) {
 
    var cmdiocontroller = new cmdio.io(socket);
    
    cmdiocontroller.setCmds(ProductsInterface.getMethods());
    
    var addListener = function (product) {
	 cmdiocontroller.send('addProduct', {product: product});
    }

    var modListener = function (product) {
	 cmdiocontroller.send('modProduct', {product: product});
    }
    
    var delListener = function (pid) {
	 cmdiocontroller.send('delProduct', {id: pid});
    }
    
    ProductsInterface.on('add', addListener);
    ProductsInterface.on('mod', modListener);
    ProductsInterface.on('del', delListener);
    
    cmdiocontroller.send('hello');
 
    socket.on('disconnect', function () {
	ProductsInterface.removeListener('add', addListener);
	ProductsInterface.removeListener('mod', modListener);
	ProductsInterface.removeListener('del', delListener);
	
	cmdiocontroller = null;
	socket = null;
    });
    
});
