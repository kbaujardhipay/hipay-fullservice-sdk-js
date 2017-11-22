
casper.test.begin('Test example JKurc', function(test) {
    casper.start(baseURL)
        .then(function() {
            // Step 1
            this.waitForSelector('input[data-hipay-id="card-holder"]', function success(){
                casper.fillSelectors('body', {
                    'input[data-hipay-id="card-holder"]': "Test",
                }, false);

                // this.sendKeys('input[data-hipay-id="card-holder"]', 'Test');


                var value = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-holder"]').value
                });

                test.assertEquals(value, "Test");


            }, function fail() {
                test.assertExists('input[data-hipay-id="card-holder"]',"Field 'Card-Holder' exist")
            },1000);
        })

        .then(function(){
            this.waitForSelector('input[data-hipay-id="card-number"]', function success(){
                casper.fillSelectors('body', {
                    'input[data-hipay-id="card-number"]': "41111111111111111",
                }, false);

                // this.sendKeys('input[data-hipay-id="card-number"]', '41111111111111111');

                var value = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-number"]').value
                });

                test.assertEquals(value, "4111 1111 1111 1111", value + "==" + "4111 1111 1111 1111");

            }, function fail() {
                test.assertExists('input[data-hipay-id="card-number"]',"Field 'Card-Number' exist")
            },1000);
        })

        .then(function(){
            this.waitForSelector('input[data-hipay-id="card-expiry-date"]', function success(){
                casper.fillSelectors('body', {
                    'input[data-hipay-id="card-expiry-date"]': "1230",
                }, false);


                this.sendKeys('input[data-hipay-id="card-expiry-date"]', "1230");

                var value = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-expiry-date"]').value
                });

                test.assertEquals(value, "12 / 30", value + '==' +  "12 / 30");

            }, function fail() {
                test.assertExists('input[data-hipay-id="card-expiry-date"]',"Field 'Card Expiry Date' exist")
            },1000);
        })


        .then(function(){
            this.waitForSelector('input[data-hipay-id="card-cvv"]', function success(){
                casper.fillSelectors('body', {
                    'input[data-hipay-id="card-cvv"]': "123",
                }, false);


                this.sendKeys('input[data-hipay-id="card-cvv"]', "123");

                var value = this.evaluate(function() {
                    return document.querySelector('input[data-hipay-id="card-cvv"]').value
                });

                test.assertEquals(value, "123", value + '==' +  "123");

            }, function fail() {
                test.assertExists('input[data-hipay-id="card-expiry-date"]',"Field 'Card Expiry Date' exist")
            },1000);
        })
        .run(function() {
            test.done();
        });
});
