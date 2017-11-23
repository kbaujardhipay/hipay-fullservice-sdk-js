var fs = require('fs'),
    utils = require('utils'),
    x = require('casper').selectXPath,
    baseURL = casper.cli.get('url'),
    defaultViewPortSizes = { width: 1920, height: 1080 },
    cardNumber = {
        visa: '4111111111111111'
    },
    cardBrand = {
        visa: 'VISA'
    },
    pathHeader = "bin/tests/",
    pathErrors = pathHeader + "errors/";


casper.test.begin('Parameters', function(test) {
    /* Set default viewportSize and UserAgent */
    casper.userAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36');
    casper.options.viewportSize = {width: defaultViewPortSizes["width"], height: defaultViewPortSizes["height"]};

    var img = 0;
    test.on('fail', function() {
        img++;
        casper.echo("URL: " + casper.currentUrl, "WARNING");
        casper.capture(pathErrors + 'fail' + img + '.png');
        test.comment("Image 'fail" + img + ".png' captured into '" + pathErrors + "'");
        casper.echo('Tests réussis : ' + test.currentSuite.passes.length, 'WARNING');
    });

    casper.echo('Paramètres chargés !', 'INFO');
    test.done();
});
