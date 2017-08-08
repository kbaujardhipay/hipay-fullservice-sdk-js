<?php

require_once('credentials.php');

?><!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="width=device-width, initial-scale=1" name="viewport">

    <title>HiPay Fullservice Tokenization</title>

    <link href="./assets/basic-client.css" media="screen" rel="stylesheet" type="text/css">
    <link href="./assets/payment-methods.css" media="screen" rel="stylesheet" type="text/css">
    <link href="./assets/basicv3.css" media="screen" rel="stylesheet" type="text/css">

    <!--[if (gte IE 9) | (!IE)]><!-->
    <link rel="stylesheet" href="../npm_ajeter/main/node_modules/bootstrap/dist/css/bootstrap.css">
    <link rel="stylesheet" href="../npm_ajeter/main/node_modules/bootstrap/dist/css/bootstrap-theme.css">
    <script type="text/javascript" src="../npm_ajeter/main/node_modules/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="../npm_ajeter/main/node_modules/bootstrap/dist/js/bootstrap.js"></script>
    <!--<![endif]-->

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>

    <link rel="stylesheet" href="../npm_ajeter/old/node_modules/bootstrap/dist/css/bootstrap.css">
    <link rel="stylesheet" href="../npm_ajeter/old/node_modules/bootstrap/dist/css/bootstrap-theme.css">
    <script type="text/javascript" src="../npm_ajeter/old/node_modules/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="../npm_ajeter/old/node_modules/bootstrap/dist/js/bootstrap.js"></script>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>

    <![endif]-->

    <script type="text/javascript" src="../dist/hipay-fullservice-sdk.js"></script>
    <!--[if lt IE 9]>

    <style>

        .container
        {
            display:table;
            width: 100%;
        }

        .row
        {
            height: 100%;
            display: table-row;
        }

        .col-lg-5, .col-lg-7
        {
            display: table-cell;
        }


        *{
            padding: 0;
            margin: 0;
            box-sizing: border-box;
        }




        /* here the style */
        .vertical-align li {
            text-align: center;
        }

        .horizontal-align li img,
        .horizontal-align li span {
            float: left;
        }


    </style>
    <![endif]-->
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
                                <input type="number" class="form-control" id="input-card" placeholder="Card number" maxlength="16" value="">
                            </div>
                        </div>
                    </div>
                </div>


                <div class="row">
                    <div class="col-lg-12">
                        <div class="form-group">
                            <label class="sr-only" for="input-name">Cardholder</label>
                            <div class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-user" aria-hidden="true"></span></div>

                                <input type="text" class="form-control" id="input-name" placeholder="Cardholder" value="">
                            </div>
                        </div>
                    </div>
                </div>


                <div class="row">
                    <div class="col-lg-12">
                        <div class="form-group">
                            <label class="sr-only" for="input-name">Expiry (Month/Year)</label>
                            <div class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-calendar" aria-hidden="true"></span></div>
                                <input id="input-month" type="number"  class="form-control" placeholder="Month" maxlength="2" value="">
                                <span class="input-group-btn" style="width:0px;"></span>
                                <input id="input-year" type="number"  class="form-control" placeholder="Year" maxlength="4" value="">

                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">

                        <div class="form-group">
                            <label class="sr-only" for="input-cvv">CVV</label>
                            <div id="container-cvv" class="input-group">
                                <div class="input-group-addon-icon input-group-addon"><span class="glyphicon glyphicon-lock" aria-hidden="true"></span></div>
                                <input type="number" class="form-control" id="input-cvv" placeholder="CVV" maxlength="3" value="">
                                <span id="cvv-button" class="input-group-addon"><button type="button" data-toggle="modal" data-target="#cvv-modal">?</button></span>
                            </div>


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
                <p>For security reasons, you have to enter your card security code (CVC).
                    It's the 3-digits number on the back of your card for <span class="modal-bold">VISA®</span>, <span class="modal-bold">MASTERCARD®</span> and <span class="modal-bold">MAESTRO®</span></p>
                <p>The <span class="modal-bold">AMERICAN EXPRESS</span> security code is the 4-digits number on the front of your card.</p>
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

        $("#pay-button").click(function() {

            $("#form :input").prop("disabled", true);
            $("#form :button").prop("disabled", true);
            $("#error").text("");

            $("#pay-button").text("Loading…");

            var params = {
                card_number: $('#input-card')[0].value,
                cvc: $('#input-cvv')[0].value,
                card_expiry_month: $('#input-month')[0].value,
                card_expiry_year: $('#input-year')[0].value,
                card_holder: $('#input-name')[0].value,
                multi_use: '0'
            };


            HiPay.setTarget('stage'); // default is production/live
            HiPay.setCredentials('<?php echo $credentials['public']['username']; ?>', '<?php echo $credentials['public']['password']; ?>');

            HiPay.create(params,
                function(result) {

                    token = result.token;

                    $("#pay-button").text("Tokenize");
                    $("#order").text("The token has been created using the JavaScript SDK (client side).");

                    $('#code').text(JSON.stringify(result, null, 4));
                    $('#link-area').text('');

                    $("#charge-button").show();

                }, function (errors) {
                    $("#pay-button").text("Tokenize");
                    $("#form :input").prop("disabled", false);
                    $("#form :button").prop("disabled", false);

                    if (typeof errors.message != "undefined") {
                        $("#error").text("Error: " + errors.message);
                    } else {
                        $("#error").text("An error occurred with the request.");
                    }
                }
            );

            return false;
        });

    });
</script>


</body>
</html>