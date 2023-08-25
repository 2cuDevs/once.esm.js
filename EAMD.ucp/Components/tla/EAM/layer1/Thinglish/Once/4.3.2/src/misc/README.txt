# create SSL certificates
https://www.andrewconnell.com/blog/updated-creating-and-trusting-self-signed-certs-on-macos-and-chrome/

openssl req -nodes -new -x509 -keyout server.localhost.key -out server.localhost.cert


Generating a 2048 bit RSA private key
.....................+++
...................................+++
writing new private key to 'server.localhost.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:DE
State or Province Name (full name) []:Bavaria 
Locality Name (eg, city) []:Munich
Organization Name (eg, company) []:Donges.IT      
Organizational Unit Name (eg, section) []:IT
Common Name (eg, fully qualified host name) []:localhost
Email Address []:marcel@donges.it





sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 8443


http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'].replace(http_port,https_port) + req.url });
    console.log("http request, will go to >> ");
    console.log("https://" + req.headers['host'].replace(http_port,https_port) + req.url );
    res.end();
}).listen(http_port);


If your app is behind a trusted proxy (e.g. an AWS ELB or a correctly configured nginx), this code should work:

app.enable('trust proxy');
app.use(function(req, res, next) {
    if (req.secure){
        return next();
    }
    res.redirect("https://" + req.headers.host + req.url);
});





var httpApp = express();
var httpRouter = express.Router();
httpApp.use('*', httpRouter);
httpRouter.get('*', function(req, res){
    var host = req.get('Host');
    // replace the port in the host
    host = host.replace(/:\d+$/, ":"+app.get('port'));
    // determine the redirect destination
    var destination = ['https://', host, req.url].join('');
    return res.redirect(destination);
});
var httpServer = http.createServer(httpApp);
httpServer.listen(8080);




https://gist.github.com/ryanhanwu/5321302

httpsExpressApp.js
var express = require('express'),
    routes = require('./routes'),
    upload = require('./routes/upload'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    httpApp = express(),
    app = express(),
    certPath = "cert";


var httpsOptions = {
    key: fs.readFileSync(path.join(certPath, "ssl.key")),
    cert: fs.readFileSync(path.join(certPath, "ssl.crt"))
};
httpApp.set('port', process.env.PORT || 80);
httpApp.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
});

// all environments
app.set('port', process.env.PORT || 443);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.enable('trust proxy');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/upload', upload.s3);


http.createServer(httpApp).listen(httpApp.get('port'), function() {
    console.log('Express HTTP server listening on port ' + httpApp.get('port'));
});

https.createServer(httpsOptions, app).listen(app.get('port'), function() {
    console.log('Express HTTPS server listening on port ' + app.get('port'));
});