casper.test.begin("Test input", 6, function suite(test) {
    casper.start(baseURL);
    casper.thenOpen(baseURL, function() {
        casper.then(function () {
            // Test placeholder Card Holder
            this.echo("Test input name", "INFO");
            this.waitForSelector('input[data-hipay-id="card-holder"]', function success() {
                this.echo("Placeholder : " + this.getElementAttribute('input[data-hipay-id="card-holder"]','placeholder'), "INFO");
                test.assertEqual( this.getElementAttribute('input[data-hipay-id="card-holder"]','placeholder'),'FirstName LastName', "Placeholder 'Card-Holder' OK");
            }, function fail() {
                    test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card Holder 2' exist");
            }, 1000);
        }).then(function () {
            // Test placeholder Card Number
            this.echo("Test input number", "INFO");
            this.waitForSelector('input[data-hipay-id="card-number"]', function success() {
                test.assertEqual( this.getElementAttribute('input[data-hipay-id="card-number"]','placeholder'),'Ex : 5136 0000 0000 0000', "Placeholder 'Card-Number' OK");
            }, function fail() {
                test.assertExists('input[data-hipay-id="card-number"]', "Field 'Card Number' exist");
            }, 1000);
        }).then(function () {
            // Test placeholder Card Expiry date
            this.echo("Test input expiry date", "INFO");
            this.waitForSelector('input[data-hipay-id="card-expiry-date"]', function success() {
                test.assertEqual( this.getElementAttribute('input[data-hipay-id="card-expiry-date"]','placeholder'),'MM / YY', "Placeholder 'Card Expiry Date' OK");
            }, function fail() {
                test.assertExists('input[data-hipay-id="card-number"]', "Field 'Card Expiry Date' exist");
            }, 1000);
        }).then(function () {
            // Test placeholder Card CVV
            this.echo("Test input CVV", "INFO");
            this.waitForSelector('input[data-hipay-id="card-cvv"]', function success() {
                test.assertEqual( this.getElementAttribute('input[data-hipay-id="card-cvv"]','placeholder'),'123', "Placeholder 'Card CVV' OK");
            }, function fail() {
                test.assertExists('input[data-hipay-id="card-cvv"]', "Field 'Card CVV' exist");
            }, 1000);
        }).then(function () {
            // Test Bouton helper CVV
            this.echo("Test helper CVV", "INFO");
            this.waitForSelector('span[id="cvv-button"]', function success() {
                test.assertExists( 'span[id="cvv-button"]', "'Button CVV Helper' OK");
            }, function fail() {
                test.assertExists( 'span[id="cvv-button"]', "'Button CVV Helper' OK");
            }, 1000);
        }).then(function () {
            // Test Pay Button
            this.echo("Test Pay Button", "INFO");
            this.waitForSelector('button[data-hipay-id="pay-button"]', function success() {
                test.assertExists( 'button[data-hipay-id="pay-button"]', "'Pay Button' OK");
            }, function fail() {
                test.assertExists( 'button[data-hipay-id="pay-button"]', "'Pay Button' OK");
            }, 1000);
        });
    });

    casper.run(function () {
        test.done();
    });
 });


