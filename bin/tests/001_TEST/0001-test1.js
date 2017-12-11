

// for (indexCard in cardCollection) {

    // forEach(function (indexCard) {

        //var tab = line.split(";");


        casper.test.begin("Test cartes", 14, function suite(test) {

            casper.start(baseURL);
            casper.capture('bin/tests/screenshots/start.png');
            // var links = [
            //     'http://google.com/',
            //     'http://yahoo.com/',
            //     'http://bing.com/'
            // ];
            test.info(baseURL);
            casper.each(cardCollection, function(self, card) {
                self.thenOpen(baseURL, function() {

                    this.capture('bin/tests/screenshots/start2.png');

                    casper.then(function () {
                        // Step 1
                        this.echo("Filling Payment form for " + card.type, "INFO");

                        this.waitForSelector('input[data-hipay-id="card-holder"]', function success() {
                            test.info("Filling card holder");
                            casper.fillSelectors('div#form form', {
                                'input[data-hipay-id="card-holder"]': "Card Holder",
                                'input[data-hipay-id="card-expiry-date"]': "12 / 30",
                                'input[data-hipay-id="card-cvv"]': "123"
                            }, false);
                            test.info("Filling card number");
                            this.sendKeys('input[data-hipay-id="card-number"]', card.number);
                            this.click('button[data-hipay-id="pay-button"]');
                            test.info("Filling OK");
                        }, function fail() {
                            test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card-Holder' exist");
                        }, 1000);
                    }).then(function () {
                        this.waitForSelector('div#tokenize-content-token', function success() {
                            this.echo("Check SDK Response", "INFO");
                            test.assertExists('div#tokenize-content-token');
                            test.assertExists('div#tokenize-content-message');
                            // code2=this.fetchText('div#code2');
                            var tokenContent = this.fetchText('div#tokenize-content-token');

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
                            var regexBrandString = "\"brand\": \"(" + card.brand + ")\"";
                            var regexBrand = new RegExp(regexBrandString);
                            var matchesBrand = tokenContent.match(regexBrand);
                            var extractBrand;
                            if (matchesBrand && matchesBrand[1]) {
                                extractBrand = matchesBrand[1];
                            }
                            test.info('brand is ' + extractBrand);
                            test.assertEquals(extractBrand, card.brand);


                            // Test pan
                            var panMask = card.number.substring(0, 6) + 'xxxxxx' + card.number.substring(12, card.number.length);
                            var regexPanString = "\"pan\": \"(" + panMask + ")\"";
                            var regexPan = new RegExp(regexPanString);
                            var matchesPan = tokenContent.match(regexPan);
                            var extractPan;
                            if (matchesPan && matchesPan[1]) {
                                extractPan = matchesPan[1];
                            }
                            test.info('pan is ' + extractPan);
                            test.assertEquals(extractPan, panMask);


                            // Test issuer
                            var regexIssuerString = "\"issuer\": \"(" + card.issuer + ")\"";
                            var regexIssuer = new RegExp(regexIssuerString);
                            var matchesIssuer = tokenContent.match(regexIssuer);
                            var extractIssuer;
                            if (matchesIssuer && matchesIssuer[1]) {
                                extractIssuer = matchesIssuer[1];
                            }
                            test.info('issuer is ' + extractIssuer);
                            test.assertEquals(extractIssuer, card.issuer);

                            // Test country
                            var regexCountryString = "\"country\": \"(" + card.country + ")\"";
                            var regexCountry = new RegExp(regexCountryString);
                            var matchesCountry = tokenContent.match(regexCountry);
                            var extractCountry;
                            if (matchesCountry && matchesCountry[1]) {
                                extractCountry = matchesCountry[1];
                            }
                            test.info('country is ' + extractCountry);
                            test.assertEquals(extractCountry, card.country);


                        }, function fail() {
                            test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card-Holder' exist");

                            test.assertExists('div#tokenize-content-token' , "Container tokenize-content-token exist");
                            test.assertExists('div#tokenize-content-message', "Container tokenize-content-message exist");
                        }, 25000);


                    });






                });


            });
            // casper.each(cardCollection, function(self, indexCard) {
            //     this.echo("Filling Payment form for" + currentCard.type, "INFO");
            //     self.thenOpen(baseURL, function() {
            //
            //     });
            //     // var currentCard = cardCollection[indexCard];
            //
            // });





            // .then(function () {
            //     // this.waitForText('The token has been created using the JavaScript SDK (client side).', function success(){
            //     this.waitForSelector('div#tokenize-content-token', function success() {
            //
            //         this.echo("Check SDK Response", "INFO");
            //         test.assertExists('div#tokenize-content-token');
            //         test.assertExists('div#tokenize-content-message');
            //         // code2=this.fetchText('div#code2');
            //         var tokenContent = this.fetchText('div#tokenize-content-token');
            //
            //         test.info('Response is token ' + tokenContent);
            //       Todo Verifier avec un objet json si la carte est celle envoyée, si le token a un bon format etc
            //
            //         // Test token exists and is 40 length
            //         var matchesToken = tokenContent.match(/"token": "([a-z0-9]{40})",/);
            //         var extractToken;
            //         if (matchesToken && matchesToken[1]) {
            //             extractToken = matchesToken[1];
            //         }
            //         test.info('token is ' + extractToken);
            //         test.assertEquals(extractToken.length, 40);
            //         test.info('token length is 40');
            //
            //
            //         // Test brand
            //         var regexBrandString = "\"brand\": \"(" + cardCollection[indexCard].brand + ")\"";
            //         var regexBrand = new RegExp(regexBrandString);
            //         var matchesBrand = tokenContent.match(regexBrand);
            //         var extractBrand;
            //         if (matchesBrand && matchesBrand[1]) {
            //             extractBrand = matchesBrand[1];
            //         }
            //         test.info('brand is ' + extractBrand);
            //         test.assertEquals(extractBrand, cardCollection[indexCard].brand);
            //
            //
            //         // Test pan
            //         var panMask = cardCollection[indexCard].number.substring(0, 6) + 'xxxxxx' + cardCollection[indexCard].number.substring(12, cardCollection[indexCard].number.length);
            //         var regexPanString = "\"pan\": \"(" + panMask + ")\"";
            //         var regexPan = new RegExp(regexPanString);
            //         var matchesPan = tokenContent.match(regexPan);
            //         var extractPan;
            //         if (matchesPan && matchesPan[1]) {
            //             extractPan = matchesPan[1];
            //         }
            //         test.info('pan is ' + extractPan);
            //         test.assertEquals(extractPan, panMask);
            //
            //
            //         // Test issuer
            //         var regexIssuerString = "\"issuer\": \"(" + cardCollection[indexCard].issuer + ")\"";
            //         var regexIssuer = new RegExp(regexIssuerString);
            //         var matchesIssuer = tokenContent.match(regexIssuer);
            //         var extractIssuer;
            //         if (matchesIssuer && matchesIssuer[1]) {
            //             extractIssuer = matchesIssuer[1];
            //         }
            //         test.info('issuer is ' + extractIssuer);
            //         test.assertEquals(extractIssuer, cardCollection[indexCard].issuer);
            //
            //         // Test country
            //         var regexCountryString = "\"country\": \"(" + cardCollection[indexCard].country + ")\"";
            //         var regexCountry = new RegExp(regexCountryString);
            //         var matchesCountry = tokenContent.match(regexCountry);
            //         var extractCountry;
            //         if (matchesCountry && matchesCountry[1]) {
            //             extractCountry = matchesCountry[1];
            //         }
            //         test.info('country is ' + extractCountry);
            //         test.assertEquals(extractCountry, cardCollection[indexCard].country);
            //
            //
            //     }, function fail() {
            //         test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card-Holder' exist");
            //     }, 25000);
            //
            // })


                casper.run(function () {
                    test.done();
                });


 });



// casper.test.begin('Test example JKurc', function(test) {
//
//
//
//     for (var indexCard in cardCollection) {
//         casper.start(baseURL);
//         casper.echo(indexCard + "type");
//         casper.then(function () {
//             // Step 1
//             this.echo("Filling Payment form for" + cardCollection[indexCard].type, "INFO");
//             this.waitForSelector('input[data-hipay-id="card-holder"]', function success() {
//                 casper.fillSelectors('div#form', {
//                     'input[data-hipay-id="card-holder"]': "Card Holder",
//                     'input[data-hipay-id="card-expiry-date"]': "12 / 30",
//                     'input[data-hipay-id="card-cvv"]': "123",
//                 }, false);
//                 this.sendKeys('input[data-hipay-id="card-number"]', cardCollection[indexCard].number);
//                 this.click('button[data-hipay-id="pay-button"]');
//                 test.info("Filling OK")
//             }, function fail() {
//                 test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card-Holder' exist");
//             }, 1000);
//         })
//             .then(function () {
//                 // this.waitForText('The token has been created using the JavaScript SDK (client side).', function success(){
//                 this.waitForSelector('div#tokenize-content-token', function success() {
//
//                     this.echo("Check SDK Response", "INFO");
//                     test.assertExists('div#tokenize-content-token');
//                     test.assertExists('div#tokenize-content-message');
//                     // code2=this.fetchText('div#code2');
//                     var tokenContent = this.fetchText('div#tokenize-content-token');
//
//                     test.info('Response is token ' + tokenContent);
//                     // Todo Verifier avec un objet json si la carte est celle envoyée, si le token a un bon format etc
//
//                     // Test token exists and is 40 length
//                     var matchesToken = tokenContent.match(/"token": "([a-z0-9]{40})",/);
//                     var extractToken;
//                     if (matchesToken && matchesToken[1]) {
//                         extractToken = matchesToken[1];
//                     }
//                     test.info('token is ' + extractToken);
//                     test.assertEquals(extractToken.length, 40);
//                     test.info('token length is 40');
//
//
//                     // Test brand
//                     var regexBrandString = "\"brand\": \"(" + cardCollection[indexCard].brand + ")\"";
//                     var regexBrand = new RegExp(regexBrandString);
//                     var matchesBrand = tokenContent.match(regexBrand);
//                     var extractBrand;
//                     if (matchesBrand && matchesBrand[1]) {
//                         extractBrand = matchesBrand[1];
//                     }
//                     test.info('brand is ' + extractBrand);
//                     test.assertEquals(extractBrand, cardCollection[indexCard].brand);
//
//
//                     // Test pan
//                     var panMask = cardCollection[indexCard].number.substring(0, 6) + 'xxxxxx' + cardCollection[indexCard].number.substring(12, cardCollection[indexCard].number.length);
//                     var regexPanString = "\"pan\": \"(" + panMask + ")\"";
//                     var regexPan = new RegExp(regexPanString);
//                     var matchesPan = tokenContent.match(regexPan);
//                     var extractPan;
//                     if (matchesPan && matchesPan[1]) {
//                         extractPan = matchesPan[1];
//                     }
//                     test.info('pan is ' + extractPan);
//                     test.assertEquals(extractPan, panMask);
//
//
//                     // Test issuer
//                     var regexIssuerString = "\"issuer\": \"(" + cardCollection[indexCard].issuer + ")\"";
//                     var regexIssuer = new RegExp(regexIssuerString);
//                     var matchesIssuer = tokenContent.match(regexIssuer);
//                     var extractIssuer;
//                     if (matchesIssuer && matchesIssuer[1]) {
//                         extractIssuer = matchesIssuer[1];
//                     }
//                     test.info('issuer is ' + extractIssuer);
//                     test.assertEquals(extractIssuer, cardCollection[indexCard].issuer);
//
//                     // Test country
//                     var regexCountryString = "\"country\": \"(" + cardCollection[indexCard].country + ")\"";
//                     var regexCountry = new RegExp(regexCountryString);
//                     var matchesCountry = tokenContent.match(regexCountry);
//                     var extractCountry;
//                     if (matchesCountry && matchesCountry[1]) {
//                         extractCountry = matchesCountry[1];
//                     }
//                     test.info('country is ' + extractCountry);
//                     test.assertEquals(extractCountry, cardCollection[indexCard].country);
//
//
//                 }, function fail() {
//                     test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card-Holder' exist");
//                 }, 25000);
//
//             });
//         casper.run(function () {
//             test.done();
//         });
//     }
//
//
//
// });

