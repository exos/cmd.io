
module.exports = {
    io: require('./lib/cmdio'),
    
    clientExpressRoute: function (eapp) {
        eapp.get('/cmdio/client.js', function (req, res) {
            
            var stream = require('fs').createReadStream(__dirname+'/lib/cmdio.js');
            
            res.header('Content-Type', 'text/javascript');
            
            stream.on('error', function (data) {
                res.end('Error loading file');
            });
            
            stream.on('data', function (data) {
                res.write(data);
            });
            
            stream.on('end', function (data) {
                res.end();
                stream = null;
            });
            
        });
    }

};