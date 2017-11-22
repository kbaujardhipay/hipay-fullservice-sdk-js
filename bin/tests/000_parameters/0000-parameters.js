var fs = require('fs'),
    utils = require('utils'),
    x = require('casper').selectXPath,
    baseURL = casper.cli.get('url'),
    defaultViewPortSizes = { width: 1920, height: 1080 };


casper.test.begin('Parameters', function(test) {
    /* Set default viewportSize and UserAgent */
    casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');
    casper.options.viewportSize = {width: defaultViewPortSizes["width"], height: defaultViewPortSizes["height"]};

    casper.echo('Paramètres chargés !', 'INFO');
    test.done();
});
