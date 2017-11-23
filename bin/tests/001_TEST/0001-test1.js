
casper.test.begin('Test example JKurc', function(test) {
    casper.start(baseURL)
        .then(function() {
            // Step 1
            this.echo("Filling Payment form","INFO");
            this.waitForSelector('input[data-hipay-id="card-holder"]', function success(){
                casper.fillSelectors('div#form', {
                    'input[data-hipay-id="card-holder"]': "Card Holder",
                    'input[data-hipay-id="card-expiry-date"]': "12 / 30",
                    'input[data-hipay-id="card-cvv"]': "123",
                }, false);
                this.sendKeys('input[data-hipay-id="card-number"]',cardNumber.visa);
                this.click('button[data-hipay-id="pay-button"]');
                test.info("Filling OK")
            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]',"Field 'Card-Holder' exist");
            },1000);
        })
        .then(function() {
            this.waitForText('The token has been created using the JavaScript SDK (client side).', function success(){
                this.echo("Check SDK Response","INFO");
                test.assertExists('div#infos-txt div#code');
                code=this.fetchText('div#infos-txt div#code');

                test.info('Response is ' . assertTextExists);
                // Todo Verifier avec un objet json si la carte est celle envoyée, si le token a un bon format etc
                test.assertTextExists('token');
                test.assertTextExists('brand');
            }, function fail(){
                test.assertExists('input[data-hipay-id="card-holder"]',"Field 'Card-Holder' exist");
            },25000);

        })
        .run(function() {
            test.done();
        });
});
