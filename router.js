var handlerFactory = require('./handler');
var fs = require('fs');
var parser = require('url');
var handlers = {};

exports.clear = function() {
    handlers = {};
}

exports.register = function(url, method) {
    handlers[url] = handlerFactory.createHandler(method);
}

exports.route = function(req) {
    url = parser.parse(req.url, true);
    var handler = handlers[url.pathname];
    if (!handler) handler = this.missing(req)
    return handler;
}

exports.missing = function(req) {
    return handlerFactory.createHandler(function(req, res) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end("No route registered for " + url.pathname);
    });
}