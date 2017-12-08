function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}


function testKey(key, modifiers) {
    casper.then(function () {
        casper.sendKeys("#text", key, {modifiers: modifiers});
    }).then(function () {
        casper.echo(casper.evaluate(function () {
            return document.querySelector("#text").textContent
        }))
    })
}

casper.test.begin("Test input", 10, function suite(test) {
    casper.start(baseURL);

    casper.thenOpen(baseURL, function() {
        casper.then(function () {
            // Test vide
            this.echo("Filling card number", "INFO");
            this.waitForSelector('input[data-hipay-id="card-number"]', function success() {
                var strCardNumber = '';
                var strCardNumberFormated = '';
                var strNameType = 'NONE';
                var srcImgType = '';
                this.echo("Test " + strNameType + " : " + strCardNumber, "INFO");
                this.sendKeys('input[data-hipay-id="card-number"]', strCardNumber);

                var valueCardNumber = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-number"]').value;
                });


                this.echo("Test input number value : " +  valueCardNumber, "INFO");

                test.assertEqual( valueCardNumber, strCardNumberFormated, strNameType + " format OK");

                this.echo("Test img src value : " +  this.getElementAttribute('img[data-hipay-id="card-type"]','src'), "INFO");
                test.assertEqual( this.getElementAttribute('img[data-hipay-id="card-type"]','src'),srcImgType, "Img type : " + strNameType + " OK");
            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card Number' exist");
            }, 1000);
        });
    });




    casper.thenOpen(baseURL, function() {
        casper.then(function () {
            // Test Visa
            this.echo("Filling card number", "INFO");
            this.waitForSelector('input[data-hipay-id="card-number"]', function success() {
                var strCardNumber = '4111111111111111';
                var strCardNumberFormated = '4111 1111 1111 1111';
                var strNameType = 'VISA';
                var srcImgType = './img/type/ic_credit_card_visa.png';
                this.echo("Test " + strNameType + " : " + strCardNumber, "INFO");
                this.sendKeys('input[data-hipay-id="card-number"]', strCardNumber);

                var valueCardNumber = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-number"]').value;
                });


                this.echo("Test input number value : " +  valueCardNumber, "INFO");

                test.assertEqual( valueCardNumber, strCardNumberFormated, strNameType + " format OK");

                this.echo("Test img src value : " +  this.getElementAttribute('img[data-hipay-id="card-type"]','src'), "INFO");
                test.assertEqual( this.getElementAttribute('img[data-hipay-id="card-type"]','src'),srcImgType, "Img type : " + strNameType + " OK");
            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card Number' exist");
            }, 1000);
        });
    });

    casper.thenOpen(baseURL, function() {
        casper.then(function () {
            // Test AMEX
            this.echo("Filling card number", "INFO");
            this.waitForSelector('input[data-hipay-id="card-number"]', function success() {
                var strCardNumber = '374111111111111';
                var strCardNumberFormated = '3741 111111 11111';
                var strNameType = 'AMEX';
                var srcImgType = './img/type/ic_credit_card_amex.png';
                this.echo("Test " + strNameType + " : " + strCardNumber, "INFO");
                this.sendKeys('input[data-hipay-id="card-number"]', strCardNumber);

                var valueCardNumber = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-number"]').value;
                });


                this.echo("Test input number value : " +  valueCardNumber, "INFO");

                test.assertEqual( valueCardNumber, strCardNumberFormated, strNameType + " format OK");
                this.echo("Test img src value : " +  this.getElementAttribute('img[data-hipay-id="card-type"]','src'), "INFO");
                test.assertEqual( this.getElementAttribute('img[data-hipay-id="card-type"]','src'),srcImgType, "Img type : " + strNameType + " OK");

            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card Number' exist");
            }, 1000);
        });

    });

    casper.thenOpen(baseURL, function() {
        casper.then(function () {
            // Test Maestro
            this.echo("Filling card number", "INFO");
            this.waitForSelector('input[data-hipay-id="card-number"]', function success() {
                var strCardNumber = '6766000000000';
                var strCardNumberFormated = '6766 0000 0000 0';
                var strNameType = 'MAESTRO';
                var srcImgType = './img/type/ic_credit_card_maestro.png';
                this.echo("Test " + strNameType + " : " + strCardNumber, "INFO");
                this.sendKeys('input[data-hipay-id="card-number"]', strCardNumber);

                var valueCardNumber = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-number"]').value;
                });


                this.echo("Test input number value : " +  valueCardNumber, "INFO");

                test.assertEqual( valueCardNumber, strCardNumberFormated, strNameType + " format OK");
                this.echo("Test img src value : " +  this.getElementAttribute('img[data-hipay-id="card-type"]','src'), "INFO");
                test.assertEqual( this.getElementAttribute('img[data-hipay-id="card-type"]','src'),srcImgType, "Img type : " + strNameType + " OK");

            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card Number' exist");
            }, 1000);
        });

    });

    casper.thenOpen(baseURL, function() {
        casper.then(function () {
            // Test Bancontact bcmc
            this.echo("Filling card number", "INFO");
            this.waitForSelector('input[data-hipay-id="card-number"]', function success() {
                var strCardNumber = '67030000000000003';
                var strCardNumberFormated = '6703 0000 0000 0000 3';
                var strNameType = 'BANCONTACT';
                var srcImgType = './img/type/ic_credit_card_bcmc.png';
                this.echo("Test " + strNameType + " : " + strCardNumber, "INFO");
                this.sendKeys('input[data-hipay-id="card-number"]', strCardNumber);

                var valueCardNumber = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-number"]').value;
                });


                this.echo("Test input number value : " +  valueCardNumber, "INFO");

                test.assertEqual( valueCardNumber, strCardNumberFormated, strNameType + " format OK");
                this.echo("Test img src value : " +  this.getElementAttribute('img[data-hipay-id="card-type"]','src'), "INFO");
                test.assertEqual( this.getElementAttribute('img[data-hipay-id="card-type"]','src'),srcImgType, "Img type : " + strNameType + " OK");

            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]', "Field 'Card Number' exist");
            }, 1000);
        });

    });


    casper.run(function () {
        test.done();
    });
 });


