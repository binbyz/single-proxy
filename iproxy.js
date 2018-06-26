const http      = require('http')
    , ip        = require('ip')
    , moment    = require('moment')
    , url       = require('url')
    , httpProxy = require('http-proxy')
    , proxy     = httpProxy.createProxyServer({})
    , env       = require('dotenv').config()
    , cluster   = require('cluster')
    , os        = require('os')
    , colors    = require('colors/safe')
    , workers   = [];

const HOST_IP = ip.address();
const LISTEN_PORT = 8722;
const VERSION = '1.2';
const REGEX_EXCEPT_DOMAINS = /^(?:(?:(?!adn|ads|static|upload|upload2|kstatic|img|fnt|pds)[\w\d\-]+)\.)?inven\.co\.kr$/i;

const fReformPath = (path) => {
    path = String(path).replace(/^https?\:\/\/(?:www\.)?inven\.co\.kr/i, '');
    return path.length >= 1 ? path : '/';
};

proxy.on('proxyReq', (proxyReq, req, res, options) => {
    let target = url.parse(req.url);

    if (REGEX_EXCEPT_DOMAINS.test(target.host)) {
        proxyReq.setHeader('X-Special-Inven-Header', `iProxy@${VERSION} <${process.env.PROXY_USER}>`);
        console.log(` iProxy@${VERSION} ${colors.yellow(req.method)} ${proxyReq.path} ${colors.cyan(req.connection.remoteAddress)}`);
    }
});

proxy.on('error', (err, req, res) => {
    if (!res.headersSent) {
        res.writeHead(500);
    }

    res.end();
});

http.createServer((req, res) => {
    let target = url.parse(req.url)
        , originHost = target.host;

    if (REGEX_EXCEPT_DOMAINS.test(target.host)) {
        target.host = process.env.MIRROR_HOST;
    }

    proxy.web(req, res, {
        target: target.protocol + '//' + target.host
    });
}).listen(LISTEN_PORT, HOST_IP);
