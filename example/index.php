<?php

require_once('credentials.php');

?><!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="width=device-width, initial-scale=1" name="viewport">

    <title>HiPay Fullservice Tokenization</title>

    <link rel="stylesheet" href="../node_modules/bootstrap/dist/css/bootstrap.css">
    <link rel="stylesheet" href="../node_modules/bootstrap/dist/css/bootstrap-theme.css">

    <link href="./assets/example.css" media="screen" rel="stylesheet" type="text/css">
    <link href="./assets/custom.css" media="screen" rel="stylesheet" type="text/css">

    <script type="text/javascript" src="../node_modules/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="../node_modules/bootstrap/dist/js/bootstrap.js"></script>

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
    <script src="../node_modules/lt-ie-9/lt-ie-9.min.js"></script>
    <link href="./assets/old_bws.css" media="screen" rel="stylesheet" type="text/css">
    <![endif]-->

<!--    <script type="text/javascript" src="./assets/input.js"></script>-->
    <script type="text/javascript" src="../dist/hipay-fullservice-sdk.js"></script>

</head>

<body>
<div id="main" class="container">

    <div class="row">
        <div class="col-sm-12 col-lg-7">

            <!-- Main component for a primary marketing message or call to action -->
            <div class="scontainer" id ="infos-txt" class="">
                <h1 class="main-title" id="price">HiPay Direct Post Tokenization Simulator</h1>
                <p id="order">Submit the form in oder to tokenize the credit card details using the HiPay Fullservice SDK for JavaScript (payment details won't hit the server). You will see the HiPay Fullservice platform response below.</p>
                <div id="code"></div>
                <p id="link-area">
                    <a class="" role="link" href="#null" id="link">Click here</a> to fill the form with sample payment details.
                </p>
                <p id="charge" >
                    <a class="btn btn-lg btn-primary" role="button" href="#null" id="charge-button" style="display: none;">Create a test charge on this token (server-side PHP SDK)</a>
                </p>
            </div>
        </div>

        <div class="col-sm-12 col-lg-5">
            <div class="scontainer" id="form">
                <p class="form-description details">
                    Enter your payment details:
                </p>

                <div class="row">
                    <div class="col-lg-12">
                        <div class="form-group">
                            <label class="sr-only" for="input-card">Card number</label>
                            <div class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-credit-card" aria-hidden="true"></span></div>
                                <input type="tel" class="form-control" id="input-card"  placeholder="Ex : 5136 0000 0000 0000" autocomplete="off" pattern="\d*" name="cardNumber" value="">
<!--                                <span id="card-type" class="input-group-addon"></span>-->
                            </div>
                            <div id="creditCardNumberMessageContainer" class="inputMessageContainer"></div>
                        </div>
                    </div>
                </div>


                <div class="row">
                    <div class="col-lg-12">
                        <div class="form-group">
                            <label class="sr-only" for="input-name">Prénom Nom</label>
                            <div class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></div>

                                <input type="text" class="form-control" id="input-name" placeholder="Prénom Nom" value="">
                            </div>
                        </div>
                    </div>
                </div>


<!--                <div class="row">-->
<!--                    <div class="col-lg-12">-->
<!--                        <div class="form-group">-->
<!--                            <label class="sr-only" for="input-name">Expiry (Month/Year)</label>-->
<!--                            <div class="input-group">-->
<!--                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></div>-->
<!--                                <input id="input-month" type="number"  class="form-control" placeholder="Month" maxlength="2" value="">-->
<!--                                <span class="input-group-btn" style="width:0px;"></span>-->
<!--                                <input id="input-year" type="number"  class="form-control" placeholder="Year" maxlength="4" value="">-->
<!---->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
                <div class="row">
                    <div class="col-lg-12">
                        <div class="form-group">
                            <label class="sr-only" for="input-name">MM / YY</label>
                            <div class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></div>

                                <input type="text" class="form-control" id="input-expiry-date" placeholder="MM / YY" value="">
                            </div>
                            <div id="creditCardExpiryDateMessageContainer" class="inputMessageContainer"></div>

                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">

                        <div class="form-group">
                            <label class="sr-only" for="input-cvv">123</label>
                            <div id="container-cvv" class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-lock" aria-hidden="true"></span></div>
                                <input class="form-control" id="input-cvv" placeholder="123" maxlength="3" value="">
                                <span id="cvv-button" class="input-group-addon"><button type="button" data-toggle="modal" data-target="#cvv-modal">?</button></span>
                            </div>
                            <div id="creditCardCVVMessageContainer" class="inputMessageContainer"></div>


                        </div>

                    </div>

                    <!--                <div class="col-sm-6 col-lg-2">-->
                    <!--                    <span  class="input-group-btn">-->
                    <!--                        <button type="button" data-toggle="modal" data-target="#cvv-modal">?</button>-->
                    <!--                    </span>-->
                    <!--                </div>-->

                </div>


                <div class="row">
                    <div class="col-lg-12">
                        <div id="submit-zone">
                            <div id="error"></div>
                            <button class="btn btn-large" type="button" data-toggle="modal" data-target="#other-method-modal" id="pay-button">Tokenize</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    </div>

</div> <!-- /container -->

<div class="modal fade" id="cvv-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <div id="modal-header-title">
                    <h4 class="modal-title" id="myModalLabel">Card verification code</h4>
                </div>
                <div id="modal-header-close">
                    <button type="button" id="btn-close" data-dismiss="modal"></button>
                </div>
            </div>
            <div class="modal-body">
                <p id="container-cvv-help-message"></p>
<!--                <p>For security reasons, you have to enter your card security code (CVC).-->
<!--                    It's the 3-digits number on the back of your card for <span class="modal-bold">VISA®</span>, <span class="modal-bold">MASTERCARD®</span> and <span class="modal-bold">MAESTRO®</span></p>-->
<!--                <p>The <span class="modal-bold">AMERICAN EXPRESS</span> security code is the 4-digits number on the front of your card.</p>-->
                <div id="cvv-img">
                    <img src="./assets/card.png">
                </div>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    $(document).ready(function(){
        var token = null;

        $('#link').click(function() {
            $('#input-card').prop('value', '4111111111111111');
            $('#input-cvv').prop('value', '123');
            $('#input-month').prop('value', '12');
            $('#input-year').prop('value', '2020');
            $('#input-name').prop('value', 'John Doe');
        });

//        HiPay.Form.change(function() {
//            alert('toto');
//            $("#pay-button").prop('disabled', !HiPay.Form.paymentFormDataIsValid());
//        });
//
//        window.onload = function(e){
//            document.getElementById('input-card').addEventListener('change', HiPay.Form.change);
//        }


        $("#charge-button").click(function() {

            $("#charge-button").text("Loading…");
            $("#charge-button").prop("disabled", true);

            $.ajax({
                url : 'order.php?token='+token,
                type : 'GET',
                dataType : 'html',
                success : function(html, status){
                    $('#order').html(html);
                    $('#code').html('');
                    $("#charge-button").hide();
                },

                error : function(result, status, error){
                    $('#order').html(result.responseText);
                    $('#code').html('');
                    $("#charge-button").text("Try again to create a charge…");
                    $("#charge-button").prop("disabled", false);
                },
            });

        });

        $("#pay-button").prop('disabled', !HiPay.Form.paymentFormDataIsValid());
            HiPay.Form.change(function() {

                console.log(HiPay.getCVVInformation());
                console.log('change form');
                $("#pay-button").prop('disabled', !HiPay.Form.paymentFormDataIsValid());
                var errorCollection = HiPay.Form.paymentFormDataGetErrors();
                console.log("errorCollection from client");
                console.log(errorCollection);
            });


        var focusHandler = function(event) {
            var type = event.target.nodeName.toLowerCase();
            if(type == 'input' || type == 'textarea') {
                //Do something
            }
        };

        function focusHandler(){

            console.log("test");
        }
        document.body.addEventListener('focus', focusHandler, true); //Non-IE
        document.body.onfocusin = focusHandler; //IE

        $("#pay-button").click(function() {

            $("#form :input").prop("disabled", true);
            $("#form :button").prop("disabled", true);
            $("#error").text("");

            $("#pay-button").text("Loading…");

            var params = {
                card_number: $('#input-card')[0].value,
//                card_expiry_month: $('#input-month')[0].value,
//                card_expiry_year: $('#input-year')[0].value,
                card_expiry_date: $('#input-expiry-date')[0].value,
                card_holder: $('#input-name')[0].value,
                cvv: $('#input-cvv')[0].value,
                multi_use: '0',
                generate_request_id: '0'
            };


            HiPay.setTarget('stage'); // default is production/live
            HiPay.setCredentials('<?php echo $credentials['public']['username']; ?>', '<?php echo $credentials['public']['password']; ?>');

//            HiPay.create(params,
//                function(result) {
//
//                    token = result.token;
//
//                    $("#pay-button").text("Tokenize");
//                    $("#order").text("The token has been created using the JavaScript SDK (client side).");
//
//                    $('#code').text(JSON.stringify(result, null, 4));
//                    $('#link-area').text('');
//
//                    $("#charge-button").show();
//
//                }, function (errors) {
//                    $("#pay-button").text("Tokenize");
//                    $("#form :input").prop("disabled", false);
//                    $("#form :button").prop("disabled", false);
//
//                    if (typeof errors.message != "undefined") {
//                        $("#error").text("Error: " + errors.message);
//                    } else {
//                        $("#error").text("An error occurred with the request.");
//                    }
//                }
//            );

//            HiPay.tokenize(params)


            HiPay.Form.tokenizePaymentFormData()
                .then(function(cardToken) {
                token = cardToken.token;
                $("#pay-button").text("Tokenize");
                $("#order").text("The token has been created using the JavaScript SDK (client side).");

                $('#code').text(JSON.stringify(cardToken, null, 4));
                $('#link-area').text('');

                $("#charge-button").show();
            })
                .catch(function(error){
                    if (error.code === HiPay.ErrorReason.APIIncorrectCredentials) { // égal à 1012003
                        console.log("Invalid crédentials");
                    }

                    if (error.code === HiPay.ErrorReason.InvalidCardToken) { // égal à 1012003
                        console.log("Token passé invalide…");
                    }


                    $("#pay-button").text("Tokenize");
                    $("#form :input").prop("disabled", false);
                    $("#form :button").prop("disabled", false);





                    if (error.errorCollection != undefined && error.errorCollection.length > 0) {
                        for (var i = 0; i < error.errorCollection.length; i++) {
                            var errorParameters = error.errorCollection[i];
                            $("#error").append(errorParameters.message);
                        }
                    }

                });


//            HiPay.tokenize(params['card_number'], params['card_expiry_month'], params['card_expiry_year'], params['card_holder'], params['cvv'], params['multi_use'], params['generate_request_id'] )
//                .then(function(cardToken) {
//                    token = cardToken.token;
//                    $("#pay-button").text("Tokenize");
//                    $("#order").text("The token has been created using the JavaScript SDK (client side).");
//
//                    $('#code').text(JSON.stringify(cardToken, null, 4));
//                    $('#link-area').text('');
//
//                    $("#charge-button").show();
//                })
//                .catch(function(error){
//                    if (error.code === HiPay.ErrorReason.APIIncorrectCredentials) { // égal à 1012003
//                        console.log("Invalid crédentials");
//                    }
//
//                    if (error.code === HiPay.ErrorReason.InvalidCardToken) { // égal à 1012003
//                        console.log("Token passé invalide…");
//                    }
//
//
//                    $("#pay-button").text("Tokenize");
//                    $("#form :input").prop("disabled", false);
//                    $("#form :button").prop("disabled", false);
//
//
//
//
//
//                    if (error.errorCollection != undefined && error.errorCollection.length > 0) {
//                        for (var i = 0; i < error.errorCollection.length; i++) {
//                            var errorParameters = error.errorCollection[i];
//                            $("#error").append(errorParameters.message);
//                        }
//                    }
//
//                });


            return false;
        });

    });
</script>


</body>
</html>