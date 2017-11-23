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
            // this.waitForText('The token has been created using the JavaScript SDK (client side).', function success(){
                this.waitForSelector('div#tokenize-content-token', function success() {

                this.echo("Check SDK Response","INFO");
                test.assertExists('div#tokenize-content-token');
                test.assertExists('div#tokenize-content-message');
                // code2=this.fetchText('div#code2');
                var tokenContent=this.fetchText('div#tokenize-content-token');

                test.info('Response is token ' + tokenContent);
                // Todo Verifier avec un objet json si la carte est celle envoyée, si le token a un bon format etc

                    // Test token exists and is 40 length
                    var matchesToken = tokenContent.match(/"token": "([a-z0-9]{40})",/);
                    var extractToken;
                    if (matchesToken && matchesToken[1]) {
                        extractToken = matchesToken[1];
                    }
                    test.info('token is ' + extractToken);
                    test.assertEquals(extractToken.length, 40);
                    test.info('token length is 40');


                    // Test brand
                    var regexBrandString =  "\"brand\": \"("+cardBrand.visa+")\"";
                    var regexBrand = new RegExp(regexBrandString);
                    var matchesBrand = tokenContent.match(regexBrand);
                    var extractBrand;
                    if (matchesBrand && matchesBrand[1]) {
                        extractBrand = matchesBrand[1];
                    }
                    test.info('brand is ' + extractBrand);
                    test.assertEquals( extractBrand, cardBrand.visa);


                    // Test pan
                    var panMask = cardNumber.visa.substring(0, 6) + 'xxxxxx' + cardNumber.visa.substring(12, cardNumber.visa.length) ;
                    var regexPanString =  "\"pan\": \"("+panMask+")\"";
                    var regexPan = new RegExp(regexPanString);
                    var matchesPan = tokenContent.match(regexPan);
                    var extractPan;
                    if (matchesPan && matchesPan[1]) {
                        extractPan = matchesPan[1];
                    }
                    test.info('pan is ' + extractPan);
                    test.assertEquals( extractPan, panMask);


                    // Test issuer
                    var regexIssuerString =  "\"issuer\": \"(JPMORGAN CHASE BANK, N.A.)\"";
                    var regexIssuer = new RegExp(regexIssuerString);
                    var matchesIssuer = tokenContent.match(regexIssuer);
                    var extractIssuer;
                    if (matchesIssuer && matchesIssuer[1]) {
                        extractIssuer = matchesIssuer[1];
                    }
                    test.info('issuer is ' + extractIssuer);
                    test.assertEquals( extractIssuer, "JPMORGAN CHASE BANK, N.A.");

                    // Test country
                    var regexCountryString =  "\"country\": \"(US)\"";
                    var regexCountry = new RegExp(regexCountryString);
                    var matchesCountry = tokenContent.match(regexCountry);
                    var extractCountry;
                    if (matchesCountry && matchesCountry[1]) {
                        extractCountry = matchesCountry[1];
                    }
                    test.info('country is ' + extractCountry);
                    test.assertEquals( extractCountry, "US");


            }, function fail(){
                test.assertExists('input[data-hipay-id="card-holder"]',"Field 'Card-Holder' exist");
            },25000);

        })
        .run(function() {
            test.done();
        });
});
