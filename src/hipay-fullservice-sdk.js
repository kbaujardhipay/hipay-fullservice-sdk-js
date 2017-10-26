
/**
 * HiPay Fullservice library
 *
 * @class HiPay
 * @param {HiPay} HiPay
 *
 */
var HiPay = (function (HiPay) {

    var HiPay = {};

    /**
     *
     * @class HiPay.Form
     *
     */
    HiPay.Form = {};
    /**
     * Locale fr_FR ...
     * @attribute HiPay.Form.locale
     *
     */
    HiPay.Form.locale = "fr_FR";

    var _endPointTokenize = {
        stage: 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json',
        prod: 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json'
    };

    var _endPointAvailablePaymentProducts = {
        stage: 'https://stage-secure-gateway.hipay-tpp.com/rest/v2/available-payment-products',
        prod: 'https://stage-secure-gateway.hipay-tpp.com/rest/v2/available-payment-products'
    };

    var _separatorMonthYear = ' / ';

    var _maxYearExpiry = 30;

    var _translationJSON = {
        "en_EN" : {
            "FORM_CVV_3_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). It's the 3-digits number on the back of your card for VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). The AMERICAN EXPRESS security code is the 4-digits number on the front of your card.",

            // error message
            "FORM_ERROR_INVALID_CARD_NUMBER": "Invalid card number.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "The expiration date is already past.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "The month field must be between 1 and 12.",
            "FORM_ERROR_INVALID_CVV": "The CVV field must contain %NUMBER% digits.",
            "FORM_ERROR_DEFAULT": "An error occured.",

            // placeholder
            "FORM_PLACEHOLDER_CARD_NUMBER": "Ex : 5136 0000 0000 0000",
            "FORM_PLACEHOLDER_CARD_HOLDER": "FirstName LastName",
            "FORM_PLACEHOLDER_CARD_EXPIRY_DATE": "MM"+_separatorMonthYear+"YY",
            "FORM_PLACEHOLDER_CARD_CVV": "123"

        },
        "fr_FR" : {
            "FORM_CVV_3_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Ce code correspond aux 3 chiffres visibles au verso de votre carte VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Le code de securité AMERICAN EXPRESS est un nombre à 4 chiffres au recto de votre carte.",
            // error message
            "FORM_ERROR_INVALID_CARD_NUMBER": "Numéro de carte invalide.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "La date est inférieure à la date actuelle.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "Le mois doit être compris entre 1 et 12.",
            "FORM_ERROR_INVALID_CVV": "Le champ CVV doit contenir %NUMBER% caractères.",
            "FORM_ERROR_DEFAULT": "Une erreur est survenue.",

            // placeholder
            "FORM_PLACEHOLDER_CARD_NUMBER": "Ex : 5136 0000 0000 0000",
            "FORM_PLACEHOLDER_CARD_HOLDER": "Prénom Nom",
            "FORM_PLACEHOLDER_CARD_EXPIRY_DATE": "MM"+_separatorMonthYear+"AA",
            "FORM_PLACEHOLDER_CARD_CVV": "123"
        },
    };


    var _loadPaymentProduct;



    var _getLocaleTranslationWithId = function(id) {
        return _translationJSON[HiPay.Form.locale][id];
    };

    var _colorInput = {
        'default': '#005a94',
        'error': '#ff0000',
    };

    var _cvvContainerId = "container-cvv-help-message";

    var _idInputMapper = {
        cardNumber: 'input-card',
        cardType: 'card-type',
        cardHolder: 'input-name',
        cardExpiryDate: 'input-expiry-date',
        // expiryMonth: 'input-month',
        // expiryYear: 'input-year',
        cardCVV: 'input-cvv'
    };


    var _idProductAPIMapper = {
        'visa': 'card_visa_info',
        'mastercard': 'card_mastercard_info',
        'diners': 'card_diners_info',
        'american-express': 'card_american_express_info',
        'maestro': 'card_maestro_info'
    };



    var _idCVVMapper = {
        card_visa_info: "CVV",
        card_mastercard_info: "CVC",
        card_american_express_info: "CID"

    };
    var _cardImg = {
        card_visa_info: "ic_credit_card_visa.png",
        card_mastercard_info: "ic_credit_card_mastercard.png",
        card_diners_info: "ic_credit_card_diners.png",
        card_american_express_info: "ic_credit_card_amex.png",
        card_maestro_info: "ic_credit_card_maestro.png"
    }

    var _cardFormatDefinition = {
        card_visa_info:
        {
            "ranges":[
                {
                    "first": 4,
                    "variable": null
                }
            ],

            "lengths": {
                "length": 16,
                "variable": null
            },

            "format":[4,4,4]
        },
        card_mastercard_info:
        {
            "ranges":[

                {
                    "first": 51,
                    "variable": 4
                }
            ],

            "lengths": {
                "length": 16,
                "variable": null
            },

            "format":[4,4,4]
        },
        card_diners_info:
        {
            "ranges":[

                {
                    "first": 300,
                    "variable": 5
                },

                {
                    "first": 38,
                    "variable": 1
                },

                {
                    "first": 2014,
                    "variable": null
                },

                {
                    "first": 2149,
                    "variable": null
                },

                {
                    "first": 309,
                    "variable": null
                },

                {
                    "first": 36,
                    "variable": null
                }
            ],
            "lengths": {
                "length": 14,
                "variable": 1
            },

            "format":[4,6]
        },
        card_american_express_info:
        {
            "ranges":[

                {
                    "first": 34,
                    "variable": null
                },

                {
                    "first": 37,
                    "variable": null
                }

            ],

            "lengths": {
                "length": 15,
                "variable": null
            },

            "format":[4,6]
        },
        card_maestro_info:
        {
            "ranges":[

                {
                    "first": 50,
                    "variable": null
                },

                {
                    "first": 56,
                    "variable": 13
                }

            ],

            "lengths": {
                "length": 12,
                "variable": 7
            },

            "format":[4,4,4,4]
        }
    };




    function _focusNextElement() {

        // var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
        var focussableElements = 'button:not([disabled]), input:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';

        // if (document.activeElement && document.activeElement.form) {
        if (document.activeElement) {

            // var focussable = Array.prototype.filter.call(document.activeElement.form.querySelectorAll(focussableElements),
            var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
                function(element) {
                    return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                });

            var index = focussable.indexOf(document.activeElement);
            focussable[index + 1].focus();
        }
    };



    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };
    /**
     * dump
     */
    function dump(obj) {
        var out = '';
        for (var i in obj) {
            out += i + ": " + obj[i] + " - ";
        }

        alert(out);

        // or, if you wanted to avoid alerts...

        // var pre = document.createElement('pre');
        // pre.innerHTML = out;
        // document.body.appendChild(pre)
    };

    var _isBrowser=new Function("try {return this===window;}catch(e){ return false;}");


    var _extend = function () {

        // Variablesbtoa
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        // Check if a deep merge
        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        // Merge the object into the extended object
        var merge = function (obj) {
            for ( var prop in obj ) {
                if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
                    // If deep merge and property is an object, merge properties
                    if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
                        extended[prop] = extend( true, extended[prop], obj[prop] );
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };

        // Loop through each object and conduct a merge
        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;

    };



    var _Error = function (code, message) {
        _processObjectPayload(this, {
            code: code,
            message: message
        });
    };

    // Properties: browser compatibility
    var _canDefineProperty = (typeof Object.defineProperty === 'function');

    if (_canDefineProperty) {
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            _canDefineProperty = false;
        }
    }

    if (_canDefineProperty) {
        Object.defineProperties(HiPay, {

            allowedParameters: {
                enumerable: true, writable: true, value:{
                    'card_number':true,
                    'card_holder':true,
                    'card_expiry_month':true,
                    'card_expiry_year':true,
                    'cvc':true,
                    'multi_use':true,
                    'generate_request_id':true
                }
            },

            /**
             * The target type stage or production to make API calls in stage or production.
             *
             * @property target
             * @default "production"
             * @type string
             * @example
             *    HiPay.target = "stage";
             */

            target: {enumerable: true, writable: true, value:'production'},

            /**
             * The username. You must provide this value in order to be able to make API calls.
             *
             * @property username
             * @type string
             */

            username: {enumerable: false, writable: true},

            /**
             * The user public key. You must provide this value in order to be able to make API calls.
             *
             * @property publicKey
             * @type string
             */

            publicKey: {enumerable: false, writable: true}
        });
    }

    else {
        allowedParameters = {
            enumerable: true, writable: true, value:{
                'card_number':true,
                'card_holder':true,
                'card_expiry_month':true,
                'card_expiry_year':true,
                'cvc':true,
                'multi_use':true,
                'generate_request_id':true
            }
        }
        HiPayPrivate.target = 'production';
    }

    // Define property helper
    var _defineProperties = function(object, properties) {
        for (var key in properties) {
            // properties[key].propertyDescriptors = Object.assign({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});
            properties[key].propertyDescriptors = _extend({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});

        }
        // var mapping = Object.assign({}, object.prototype._mapping || {}, properties);
        var mapping = _extend({}, object.prototype._mapping || {}, properties);


        if (_canDefineProperty) {
            Object.defineProperties(object.prototype, {
                "_mapping": {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: mapping
                }
            });

        } else {
            object.prototype._mapping = mapping;
        }

        if (_canDefineProperty) {
            var propConfig = {};
            for (var key in properties) {
                var valueProp = properties[key];
                propConfig[valueProp.name] = valueProp.propertyDescriptors;
            }

            Object.defineProperties(object.prototype, propConfig);
        }
    };

    var _bootstrapInstanceProperties = function (instance) {
        if (_canDefineProperty) {
            var propertyConfig = [];
            for (var key in instance._mapping) {
                // $.each(instance._mapping, function (key, val) {
                var val =  instance._mapping[key];
                propertyConfig[val.name] = _extend({}, true, val.propertyDescriptors.clone, {
                    writable: true,
                    configurable: true
                });
                // });
            }
            Object.defineProperties(instance, propertyConfig);
        }
    };

    var _doGetCaretPosition = function (ctrl)
    {
        var CaretPos = 0;

        if (ctrl.selectionStart || ctrl.selectionStart == 0)
        {// Standard.
            CaretPos = ctrl.selectionStart;
        }
        else if (document.selection)
        {// Legacy IE
            ctrl.focus ();
            var Sel = document.selection.createRange ();
            Sel.moveStart ('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        }

        return (CaretPos);
    }

    var _setCaretPosition = function(ctrl,pos)
    {
        if (ctrl.setSelectionRange)
        {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        }
        else if (ctrl.createTextRange)
        {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    var _getSelection = function (target) {
        var s = {start: 0, end:0};
        if (typeof target.selectionStart == "number"
            && typeof target.selectionEnd == "number") {
            // Firefox (and others)
            s.start = target.selectionStart;
            s.end = target.selectionEnd;
        } else if (document.selection) {
            // IE
            var bookmark = document.selection.createRange().getBookmark();
            var sel = target.createTextRange();
            var bfr = sel.duplicate();
            sel.moveToBookmark(bookmark);
            bfr.setEndPoint("EndToStart", sel);
            s.start = bfr.text.length;
            s.end = s.start + sel.text.length;
        }
        return s;
    }


    var _instanceServiceCreditCard = null;

    var _serviceCreditCard = function(charCode) {

        var serviceCreditCard = {};

        serviceCreditCard.creditCardHolderLengthMax = 60;
        serviceCreditCard.creditCardCVVLengthMax = 3;
        serviceCreditCard.cardFormatArray = [];

        serviceCreditCard.getCreditCardHolderInput = function() {
            return document.getElementById(_idInputMapper.cardHolder);
        };

        serviceCreditCard.getCreditCardNumberInput = function() {
            return document.getElementById(_idInputMapper.cardNumber);
        };

        serviceCreditCard.getCreditCardNumberValue = function() {
            return serviceCreditCard.getCreditCardNumberInput().value;
        };



        serviceCreditCard.getCardFormatArray = function() {

        };

        serviceCreditCard.getCreditCardCVVLengthMax = function(forceReload) {
            if (serviceCreditCard.creditCardCVVLengthMax == undefined || forceReload == undefined || forceReload == true) {


                var arrayFormatCVV = ['34', '35', '36', '37'];
                var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length; indexFormatCVV++) {

                    if (creditCardNumber.value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }
            }
            return serviceCreditCard.creditCardCVVLengthMax;
        };



        /* @ todo clean init */
        serviceCreditCard.getCardTypeId = function() {
            serviceCreditCard.initInfoCardWithCardNumber();
            return serviceCreditCard.idType;
        }


        serviceCreditCard.getTypeWithCardNumber = function(creditCardNumber) {


            var cardType;
            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumber.indexOf(startNumber) === 0) {

                                serviceCreditCard.idType = propt;
                                cardType = propt;


                                break;
                            } else {

                            }
                        }
                    } else {

                        if (creditCardNumber.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            serviceCreditCard.idType = propt;
                            cardType = propt;
                            break;
                        }
                    }
                }
                /* ./ range */
            }

            return cardType;

        };


        serviceCreditCard.initInfoCardWithCardNumber = function(creditCardNumber) {

            if (creditCardNumber == undefined) {
                creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
            }


            if (document.getElementById(_idInputMapper.cardType)) {
                // document.getElementById(_idInputMapper.cardType).src = undefined;
                document.getElementById(_idInputMapper.cardType).src = "";
                document.getElementById(_idInputMapper.cardType).setAttribute('style', 'display:none;');
            }
            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumber.indexOf(startNumber) === 0) {

                                // document.getElementById(_idInputMapper.cardType).innerHTML = propt;

                                serviceCreditCard.idType = propt;
                                // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';
                                document.getElementById(_idInputMapper.cardType).src = "./assets/type/" + _cardImg[propt];
                                document.getElementById(_idInputMapper.cardType).setAttribute('style','display:block;');


                                serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                                /* length */
                                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                /* ./ length */

                                break;
                            } else {

                            }
                        }
                    } else {

                        if (creditCardNumber.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            // document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                            serviceCreditCard.idType = propt;
                            // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';

                            document.getElementById(_idInputMapper.cardType).src = "./assets/type/" + _cardImg[propt];
                            document.getElementById(_idInputMapper.cardType).setAttribute('style','display:block;');


                            serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }

                            /* ./ length */
                            break;
                        }
                    }
                }
                /* ./ range */
            }

        };




        serviceCreditCard.unformatCreditCardNumber = function(cardNumberStringFormatted) {
            if (cardNumberStringFormatted != undefined) {
                return cardNumberStringFormatted.split(' ').join('');
            }
            return cardNumberStringFormatted;
        }
        // var _inputCCFinish = function(element, cardNumberString, cardLengthMin, cardLengthMax) {
        var _inputCCNumberFinish = function(element) {

            var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber([]);





            // document.getElementById("creditCardNumberMessageContainer").innerHTML="";
            // document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');
            document.getElementById(_idInputMapper.cardCVV).disabled = false;
            if ( serviceCreditCard.cardNumberStringFormatAfter != '') {

                // if maestro cvc disabled

                if (serviceCreditCard.idType == 'card_maestro_info') {

                    var cvvElement =  document.getElementById(_idInputMapper.cardCVV);
                    cvvElement.value = "";
                    // cvvElement.setAttribute('style', 'color:#333333 !important');


                    if (!cvvElement.classList.contains('inputdisabled')) {
                        // The box that we clicked has a class of bad so let's remove it and add the good class
                        // this.classList.remove('bad');
                        cvvElement.classList.add('inputdisabled');
                    } else {
                        cvvElement.classList.remove('inputdisabled');
                        // The user obviously can't follow instructions so let's alert them of what is supposed to happen next

                    }


                    // inputdisable
                    cvvElement.disabled = true;

                }

            }
            if(serviceCreditCard.cardNumberStringFormatAfter != '' && validatorCreditCardNumber.isValid( document.getElementById(_idInputMapper.cardNumber).value)) {
                _focusNextElement();
                // element.focus();
            }
            else {
                if (serviceCreditCard.cardLengthMax == serviceCreditCard.cardNumberStringAfter.length && !validatorCreditCardNumber.isValid(document.getElementById(_idInputMapper.cardNumber).value)) {



                    // validatorCreditCardNumber.displayErrorMessage()

                    //  document.getElementById("creditCardNumberMessageContainer").innerHTML="Le format de la carte n'est pas valide";
                    //  document.bgColor = _colorInput["error"];
                    // document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["error"] + ' !important');

                }
            }
        };

        var _inputCardExpiryDateFinish = function(element) {

            var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate([]);




            if ( 7 == document.getElementById(_idInputMapper.cardExpiryDate).value.length && validatorCreditCardExpiryDate.isValid( document.getElementById(_idInputMapper.cardExpiryDate).value) === true ) {


                // element.focus();
                _focusNextElement();
            } else {
                if (7 == document.getElementById(_idInputMapper.cardExpiryDate).value.length && validatorCreditCardExpiryDate.isValid(document.getElementById(_idInputMapper.cardExpiryDate).value) === false) {


                }
            }
        };


        serviceCreditCard.validatorCreditCardNumber = function(errorArray) {
            var validatorCreditCardNumber = {};





            validatorCreditCardNumber.errorCollection = errorArray || [];


            validatorCreditCardNumber.isPotentiallyValid = function(creditCardNumber) {

                var isPotentiallyValid = false;
                var startNumberArray = [];
                for (var propt in _cardFormatDefinition) {

                    /* range */
                    for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                        if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                            for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                                startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"] + j, propt]);
                            }




                        } else {
                            startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"], propt]);

                        }
                    }
                    /* ./ range */
                }



                var startNumber;
                var startNumberToCompare;


                var cardNumberMaxLength = 23;

                var propt;
                for (var indexNumber = 0; indexNumber < startNumberArray.length; indexNumber++) {


                    startNumber = startNumberArray[indexNumber][0].toString();
                    propt = startNumberArray[indexNumber][1].toString();
                    startNumberToCompare = startNumber.substr(0,Math.min(startNumber.length, creditCardNumber.length));
                    if (creditCardNumber.indexOf(startNumberToCompare) === 0) {


                        cardNumberMaxLength = _cardFormatDefinition[propt]["lengths"]["length"];
                        if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                            cardNumberMaxLength = cardNumberMaxLength + _cardFormatDefinition[propt]["lengths"]["variable"];
                        }


                        if(creditCardNumber.length < cardNumberMaxLength) {
                            isPotentiallyValid = true;
                            break;
                        } else if(creditCardNumber.length == cardNumberMaxLength) {
                            if (_isLuhnValid(creditCardNumber) === true) {
                                isPotentiallyValid = true;
                                break;
                            }
                        }
                    }
                }


                if (_isEnabled(serviceCreditCard.getCardTypeId()) === false) {
                    isPotentiallyValid = false;
                }



                if (isPotentiallyValid == false) {
                    validatorCreditCardNumber.isValid(creditCardNumber);
                }
                return isPotentiallyValid;
            }













            validatorCreditCardNumber.isValid = function (creditCardNumberUnformatted) {

                // var value = serviceCreditCard.cardNumberStringFormatAfter;

                // var creditCardNumberUnformated = serviceCreditCard.cardNumberStringAfter.split(' ').join('');

                if (creditCardNumberUnformatted != undefined) {

                    creditCardNumberUnformatted = creditCardNumberUnformatted.split(' ').join('');
                }






                if (_isEnabled(serviceCreditCard.getCardTypeId()) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));

                    console.log("not enabled");

                    return false;
                }

                if (_isTypeValid(serviceCreditCard.getCardTypeId()) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }


                if (/[^0-9-\s]+/.test(creditCardNumberUnformatted)) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }



                if (_isLengthValid(creditCardNumberUnformatted) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                if (_isLuhnValid(creditCardNumberUnformatted) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    return false;
                }

                return true;
            };

            var _isEnabled = function(cardTypeId) {

                if (_availableAndEnabledPaymentProductsCollection.length == 0) {
                    _initAvailableAndEnabledPaymentProductsCollection();
                }


                if (_availableAndEnabledPaymentProductsCollection.length == 0) {
                    return true;
                } else {
                    for (indexEnableProduct in _availableAndEnabledPaymentProductsCollection) {
                        console.log('toto');
                        console.log(_availableAndEnabledPaymentProductsCollection[indexEnableProduct]);
console.log(_idProductAPIMapper[_availableAndEnabledPaymentProductsCollection[indexEnableProduct]]);
                        console.log("cardTypeId");
                        console.log(cardTypeId);
                        if (_idProductAPIMapper[_availableAndEnabledPaymentProductsCollection[indexEnableProduct]] == cardTypeId) {
                            return true;
                        }
                    }
                }

                return false;

            }

            var _isTypeValid =function(cardTypeId) {
                if (_cardFormatDefinition.hasOwnProperty(cardTypeId) === false) {
                    return false;
                }
            }

            var _isLengthValid = function (value) {
                if (value.length < serviceCreditCard.cardLengthMin || (serviceCreditCard.cardLengthMax != null && value.length > serviceCreditCard.cardLengthMax) ) {
                    return false;
                }
                return true;
            }

            var _isLuhnValid = function (value) {
                // The Luhn Algorithm. It's so pretty.
                var nCheck = 0, nDigit = 0, bEven = false;
                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n),
                        nDigit = parseInt(cDigit, 10);

                    if (bEven) {
                        if ((nDigit *= 2) > 9) nDigit -= 9;
                    }

                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) == 0;

            };
            return validatorCreditCardNumber;
        };

        serviceCreditCard.validatorCreditCardHolder = function(errorArray) {
            var validatorCreditCardHolder = {};


            validatorCreditCardHolder.errorCollection = errorArray || [];

            validatorCreditCardHolder.isValid = function (creditCardHolderString) {
                if (creditCardHolderString == "" || creditCardHolderString == undefined || creditCardHolderString == null) {
                    return false;
                }

                if (creditCardHolderString.length > serviceCreditCard.creditCardHolderLengthMax ) {
                    return false;
                }
                return true;
            }


            validatorCreditCardHolder.isPotentiallyValid = function(creditCardHolderString) {

                var isPotentiallyValid = false;

                if (creditCardHolderString.length <= serviceCreditCard.creditCardHolderLengthMax ) {
                    isPotentiallyValid = true;
                }


                return isPotentiallyValid;
            }

            return validatorCreditCardHolder;

        };

        /**
         *
         * @param errorCollection
         * @returns {{}}
         * @constructor
         */
        serviceCreditCard.validatorCreditCardExpiryDate = function (errorCollection) {

            var validatorExpiryDate = {};
            validatorExpiryDate.errorCollection = errorCollection || [];

            validatorExpiryDate.isPotentiallyValid = function(creditCardExpiryDate) {
                var isPotentiallyValid = false;



                var splitExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);

                if (splitExpiryDate.length < 2) {

                    if (splitExpiryDate <= 12) {
                        isPotentiallyValid = true;
                    }
                } else {

                    if (splitExpiryDate.length == 2) {
                        var month = splitExpiryDate[0];
                        var year = splitExpiryDate[1];
                        if (year.length < 2) {

                            if (month <= 12 && year >= 1) {
                                isPotentiallyValid = true;
                            }
                        } else {

                            // Return today's date and time
                            var currentTime = new Date();

                            // returns the month (from 0 to 11)
                            var currentMonth = currentTime.getMonth() + 1;

                            // returns the year (four digits)
                            var currentYear = currentTime.getFullYear();

                            var yearYYYY = "20" + year;
                            if(yearYYYY > currentYear && yearYYYY <= (currentYear + _maxYearExpiry)) {
                                isPotentiallyValid = true;
                            } else if(yearYYYY == currentYear && month >= currentMonth) {
                                isPotentiallyValid = true;
                            }



                        }


                    }
                }



                if (isPotentiallyValid == false) {
                    validatorExpiryDate.isValid(creditCardExpiryDate);
                }


                return isPotentiallyValid;

            };

            validatorExpiryDate.isValid = function(creditCardExpiryDate) {

                if (creditCardExpiryDate == undefined) {
                    creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;
                }
                var splitExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
                if (splitExpiryDate.length != 2) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'format de date non valide'));
                    return false;
                }

                var month = splitExpiryDate[0];
                var year = splitExpiryDate[1];

                // Return today's date and time
                var currentTime = new Date();

                // returns the month (from 0 to 11)
                var currentMonth = currentTime.getMonth() + 1;

                // returns the year (four digits)
                var currentYear = currentTime.getFullYear();


                year = "20" + year;

                if(month > 12) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_MONTH_EXPIRY_DATE")));
                    return false;
                } else if(year < currentYear || year > (currentYear + _maxYearExpiry)) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                else if(year == currentYear && month < currentMonth || year < currentYear) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                return true;
            };

            return validatorExpiryDate;


        };

        serviceCreditCard.validatorCreditCardCVV = function(errorArray,validateAll) {
            var validatorCreditCardCVV = {};



            validatorCreditCardCVV.errorCollection = errorArray || [];





            validatorCreditCardCVV.isPotentiallyValid = function (creditCardCVVString,creditCardNumber) {


                var isPotentiallyValid = false;

                var arrayFormatCVV = ['34', '35', '36', '37'];
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {

                    if (document.getElementById(_idInputMapper.cardNumber).value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }



                if (creditCardCVVString != "" && creditCardCVVString.length <= serviceCreditCard.creditCardCVVLengthMax ) {
                    isPotentiallyValid = true;
                }

                if (serviceCreditCard.idType == 'card_maestro_info' && creditCardCVVString == "") {
                    isPotentiallyValid = true;
                }

                if (isPotentiallyValid == false) {
                    validatorCreditCardCVV.isValid(creditCardCVVString);
                }


                return isPotentiallyValid;
            };


            validatorCreditCardCVV.isValid = function (creditCardCVVString) {

                if (serviceCreditCard.idType == 'card_maestro_info') {
                    return true;
                }



                if (creditCardCVVString == "" || creditCardCVVString == undefined || creditCardCVVString == null) {
                    return false;
                }

                // cvv amex

                var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
                var arrayFormatCVV = ['34','35','36','37'];
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {

                    if (document.getElementById(_idInputMapper.cardNumber).value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }



                if (creditCardCVVString.length > serviceCreditCard.creditCardCVVLengthMax ) {
                    // validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, 'Le champ CVC doit contenir '+serviceCreditCard.creditCardCVVLengthMax+' digits'));





                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));
                    return false;
                }


                if ((validateAll == undefined || validateAll == true) && creditCardCVVString.length < serviceCreditCard.creditCardCVVLengthMax ) {
                    // validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, 'Le champ CVC doit contenir '+serviceCreditCard.creditCardCVVLengthMax+' digits'));
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));

                    return false;
                }




                return true;
            };

            return validatorCreditCardCVV;

        };

        serviceCreditCard.validatorCreditCard = function(errorCollection) {

            var validatorCreditCard = {};
            // validatorCreditCard.errorCollection = errorCollection;
            validatorCreditCard.errorCollection = [];


            validatorCreditCard.isValid = function(params) {

                var hasError = false;
                var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber();
                if (!validatorCreditCardNumber.isValid(serviceCreditCard.unformatCreditCardNumber(params['card_number']))) {
                    validatorCreditCard.errorCollection['creditCardNumber'] = validatorCreditCardNumber.errorCollection;
                    hasError = true;
                    // return false;
                }

                var validatorCreditCardHolder = serviceCreditCard.validatorCreditCardHolder(validatorCreditCard.errorCollection);
                if (!validatorCreditCardHolder.isValid(params['card_holder'])) {

                    hasError = true;
                    // return false;
                }

                var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate(validatorCreditCard.errorCollection);
                if (!validatorCreditCardExpiryDate.isValid(params['card_expiry_date'])) {
                    hasError = true;
                    // return false;
                }

                var validatorCreditCardCVV = serviceCreditCard.validatorCreditCardCVV(validatorCreditCard.errorCollection);
                if (!validatorCreditCardCVV.isValid(params['cvc'])) {
                    hasError = true;
                    // return false;
                }

                if (hasError) {
                    return false;
                }

                // document.getElementById("creditCardExpiryDateMessageContainer").innerHTML=validatorCreditCardExpiryDate.errorCollection[0]['message'];



                return true;
            };



            return validatorCreditCard;




        };

        serviceCreditCard.initCreditCardNumber = function(charCode, stringPaste){

            serviceCreditCard.lastCharCode = charCode;

            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharString = '';
            }
            else {
                serviceCreditCard.lastCharString = String.fromCharCode(charCode);
            }

            if (serviceCreditCard.lastCharString === '') {

            }

            serviceCreditCard.cardNumberStringFormatBefore = document.getElementById(_idInputMapper.cardNumber).value;
            serviceCreditCard.cardNumberStringFormatedBefore = document.getElementById(_idInputMapper.cardNumber).value;


            //realposition cursor in number
            var splitFormatBeforetemp = serviceCreditCard.cardNumberStringFormatBefore;
            serviceCreditCard.cardNumberStringUnformatedBefore = splitFormatBeforetemp.split(' ').join('');

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardNumber));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardNumberStringFormatedBefore.substr(0, startBFormat);
            var splitSubStringStart = subStringStart.split(' ');
            var nbSpaceStart = splitSubStringStart.length - 1;

            var subStringEnd =  serviceCreditCard.cardNumberStringFormatedBefore.substr(0, endBFormat);
            var splitSubStringEnd = subStringEnd.split(' ');
            var nbSpaceEnd = splitSubStringEnd.length - 1;

            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;



            if (stringPaste) {

                // delete all chars but number
                var stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {

                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = stringPaste.length;

                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }

                if (newTempStringAfter.length >= 25) {
                    newTempStringAfter =newTempStringAfter.substring(0,25);
                }



            } else {


                if (startB >= 0 && endB > 0 && startB < endB) {


                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                    // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;

                }
                else if (startB > 0) {
                    if (charCode == 8) {

                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                        startA = startA - 1;

                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                    }
                    endA = startA;
                }
            }



            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {


                if (nbBefore == startA) {


                    if (charCode == 8 || charCode == 46) {

                    } else {
                        if (stringPaste) {
                            startAtemp = startAtemp + stringPaste.length;
                        } else {
                            tempStringAfter += serviceCreditCard.lastCharString;
                            startAtemp = startAtemp + 1;
                        }


                    }


                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;


// formatage du numero

            serviceCreditCard.cardLengthMin = 0;
            serviceCreditCard.cardLengthMax = 25;

            serviceCreditCard.idType = null;



            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (tempStringAfter.indexOf(startNumber) === 0) {

                                // document.getElementById(_idInputMapper.cardType).innerHTML = propt;

                                serviceCreditCard.idType = propt;



                                // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';




                                var my_elem = document.getElementById(_idInputMapper.cardNumber);

                                // var span = document.createElement('img');
                                //
                                // span.className = 'asterisk';
                                //
                                // my_elem.parentNode.insertBefore(span, my_elem);






                                serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                                /* length */
                                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                /* ./ length */

                                break;
                            } else {

                            }
                        }
                    } else {

                        if (tempStringAfter.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            // document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                            serviceCreditCard.idType = propt;

                            // document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';








                            serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }

                            /* ./ length */
                            break;
                        }
                    }
                }
                /* ./ range */
            }

            if (serviceCreditCard.cardLengthMax == null || tempStringAfter.length <= serviceCreditCard.cardLengthMax) {
                serviceCreditCard.cardNumberStringAfter = tempStringAfter;
            }
            else {

                if (stringPaste) {
                    serviceCreditCard.cardNumberStringAfter = tempStringAfter.substr(0,serviceCreditCard.cardLengthMax);
                } else {
                    serviceCreditCard.cardNumberStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;
                    startA = startB;
                }
            }


            var numberFormatTotal = 0;

            var tempForStringAfter = "";
            if ( serviceCreditCard.cardFormatArray.length > 0) {
                var positionSpaceArray = [];
                var startFormat = 0;
                for (var i = 0; i < serviceCreditCard.cardFormatArray.length; i++) {


                    positionSpaceArray[(startFormat + serviceCreditCard.cardFormatArray[i])] = 1;
                    startFormat += serviceCreditCard.cardFormatArray[i];

                }


            }


            // var deltaCursorAfterFormat = 0;
            var numberSpaceBeforeStartFormated= 0;
            for (var nb=0; nb< serviceCreditCard.cardNumberStringAfter.length;nb++) {
                //
                //
                if (positionSpaceArray != undefined && positionSpaceArray[nb]===1) {

                    if (nb < startA) {
                        numberSpaceBeforeStartFormated +=1;
                    }
                    tempForStringAfter += ' ';


                }
                tempForStringAfter += serviceCreditCard.cardNumberStringAfter.charAt(nb);
            }

            serviceCreditCard.cardNumberStringFormatAfter = tempForStringAfter;

            var startAFormat = startA + numberSpaceBeforeStartFormated;



            document.getElementById(_idInputMapper.cardNumber).value = serviceCreditCard.cardNumberStringFormatAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardNumber), startAFormat);


            // focus next input + change color input on error

            _inputCCNumberFinish( document.getElementById(_idInputMapper.cardHolder), serviceCreditCard);




            // })(charCode);
        };

        serviceCreditCard.initCreditCardHolder = function(charCode){

            serviceCreditCard.lastCharCodeCreditCardHolder = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardHolder = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardHolder = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardHolderStringFormatedBefore = document.getElementById(_idInputMapper.cardHolder).value;

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardHolder));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, startBFormat);


            var subStringEnd =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, endBFormat);


            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;

            if (startB >= 0 && endB > 0 && startB < endB) {

                newTempStringAfter = newTempStringAfter.substring(0,startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                endA = startA;
                // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;

            }
            else if (startB > 0) {
                if(charCode == 8) {

                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);
                    // dump(tempStringAfterDebut);
                    // dump(tempStringAfterFin);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    startA = startA - 1;

                } else if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                }
                endA = startA;
            } else if(startB == 0) {
                if(charCode == 46) {
                    var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                    var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                    newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                }
                endA = startA;
            }



            var startA = startBFormat;

            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {

                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {


                    if (charCode == 8 || charCode == 46) {

                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardHolder;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;


                    }


                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;



            if (serviceCreditCard.creditCardHolderLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardHolderLengthMax) {
                serviceCreditCard.cardHolderStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardHolderStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;
                startA = startBFormat;
            }


            document.getElementById(_idInputMapper.cardHolder).value = serviceCreditCard.cardHolderStringAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardHolder), startA);





            // })(charCode);
        };




        serviceCreditCard.initCreditCardExpiryDate = function(charCode, stringPaste){



            serviceCreditCard.lastCharCodeCreditCardExpiryDate = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = String.fromCharCode(charCode);
            }

            serviceCreditCard.creditCardExpiryDateFormattedBefore = document.getElementById(_idInputMapper.cardExpiryDate).value;







            //realposition cursor in number
            var splitFormatBeforetemp = serviceCreditCard.creditCardExpiryDateFormattedBefore;
            serviceCreditCard.creditCardExpiryDateUnformattedBefore = splitFormatBeforetemp.split(_separatorMonthYear).join('');




            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardExpiryDate));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;




            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, startBFormat);

            var splitSubStringStart = subStringStart.split(_separatorMonthYear);
            var nbSpaceStart = (splitSubStringStart.length - 1)*_separatorMonthYear.length;


            var subStringEnd =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, endBFormat);


            var splitSubStringEnd = subStringEnd.split(_separatorMonthYear);
            var nbSpaceEnd = (splitSubStringEnd.length - 1)*_separatorMonthYear.length;

            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);

            var startA = startB;
            var endA = endB;

            var newTempStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;






            if (stringPaste) {


                // delete all chars but number
                var stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = stringPaste.length;
                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }

                if (newTempStringAfter.length >= 4) {
                    newTempStringAfter =newTempStringAfter.substring(0,4);
                }

            } else {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;

                }
                else if (startB > 0) {
                    if (charCode == 8) {

                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                        startA = startA - 1;

                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;


                    }
                    endA = startA;
                }
            }

            var tempStringAfter = "";
            var startAtemp = startA;


            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardExpiryDate;
                        startAtemp = startAtemp + 1;
                    }
                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            if (tempStringAfter.length <= 4) {
                serviceCreditCard.cardExpiryDateStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardExpiryDateStringAfter = serviceCreditCard.creditCardExpiryDateFormattedBefore;
                startA = startBFormat;
            }

            serviceCreditCard.cardExpiryDateStringFormattedAfter =  serviceCreditCard.cardExpiryDateStringAfter;
            if ( serviceCreditCard.cardExpiryDateStringFormattedAfter.length === 1) {
                if (serviceCreditCard.cardExpiryDateStringFormattedAfter.charAt(0) > 1) {
                    serviceCreditCard.cardExpiryDateStringFormattedAfter = "0"+serviceCreditCard.cardExpiryDateStringFormattedAfter;
                    startA = startA + 1;
                }
            }

            if ( serviceCreditCard.cardExpiryDateStringFormattedAfter.length >= 2) {

                if (serviceCreditCard.cardExpiryDateStringFormattedAfter.split(_separatorMonthYear).length < 2) {
                    serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(0, 2) + _separatorMonthYear + serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(2, serviceCreditCard.cardExpiryDateStringFormattedAfter.length);
                    startA = startA + _separatorMonthYear.length;
                }
            }

            document.getElementById(_idInputMapper.cardExpiryDate).value = serviceCreditCard.cardExpiryDateStringFormattedAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardExpiryDate), startA);
            _inputCardExpiryDateFinish( document.getElementById(_idInputMapper.cardCVV), serviceCreditCard);

        };


        serviceCreditCard.initCreditCardCVV = function(charCode, stringPaste){

            serviceCreditCard.lastCharCodeCreditCardCVV = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardCVV = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardCVV = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardCVVStringFormatedBefore = document.getElementById(_idInputMapper.cardCVV).value;

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardCVV));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, startBFormat);


            var subStringEnd =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, endBFormat);


            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);


            var startA = startB;
            var endA = endB;

            // string after

            var newTempStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;

            if (stringPaste) {
                // delete all chars but number
                stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                } else if (startB >= 0) {
                    console.log('position 0');
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }
                var startBFormat = startB + stringPaste.length;

                console.log("newTempStringAfter");
                console.log(startBFormat);
                if (newTempStringAfter.length >= 4) {
                    newTempStringAfter =newTempStringAfter.substring(0,4);
                }
            } else {

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                }
                else if (startB > 0) {
                    if (charCode == 8) {

                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB) - 1));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB)), newTempStringAfter.length);

                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                        startA = startA - 1;

                    } else if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;

                    }
                    endA = startA;
                } else if (startB == 0) {
                    if (charCode == 46) {
                        var tempStringAfterDebut = newTempStringAfter.substring(0, (parseInt(startB)));
                        var tempStringAfterFin = newTempStringAfter.substring((parseInt(startB) + 1), newTempStringAfter.length);
                        newTempStringAfter = tempStringAfterDebut + "" + tempStringAfterFin;
                    }
                    endA = startA;
                }
            }

            var startA = startBFormat;
            var tempStringAfter = "";
            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardCVV;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;
                    }
                }
                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            var arrayFormatCVV = ['34','35','36','37'];
            var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
            for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {
                if (creditCardNumber.value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                    serviceCreditCard.creditCardCVVLengthMax = 4;
                }
            }

            if (serviceCreditCard.creditCardCVVLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardCVVLengthMax) {
                serviceCreditCard.cardCVVStringAfter = tempStringAfter;
            }
            else {
                if (stringPaste) {
                    serviceCreditCard.cardCVVStringAfter = tempStringAfter.substr(0,serviceCreditCard.creditCardCVVLengthMax);
                    // startA = stringPaste.length;
                } else {
                    serviceCreditCard.cardCVVStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;
                    startA = startBFormat;
                }
            }

            document.getElementById(_idInputMapper.cardCVV).value = serviceCreditCard.cardCVVStringAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardCVV), startA);

        };
        return serviceCreditCard;
    }

    /**
     *
     */
    var _callbackEventFormChange = new Function();

    /**
     *
     * @private
     */
    var _initErrorHandler = function(e){

        // var evt = e || window.event;



        // _callbackEventFormChange();
        for (var indexInput in _idInputMapper) {
            if (indexInput != "cardType") {

                if (document.getElementById(_idInputMapper[indexInput]).classList.contains('error-card-form')) {
                    document.getElementById(_idInputMapper[indexInput]).classList.remove('error-card-form');
                }
                if (!document.getElementById(_idInputMapper[indexInput]).classList.contains('default-card-form')) {
                    document.getElementById(_idInputMapper[indexInput]).classList.add('default-card-form');
                }
                // document.getElementById(_idInputMapper[indexInput]).setAttribute('style', 'color:' + _colorInput["default"] + ' !important');
            }
        }

        var errors = HiPay.Form.paymentFormDataGetErrors();

        for (var indexError in errors) {
            if (!document.getElementById(_idInputMapper[indexInput]).classList.contains('error-card-form')) {
                // The box that we clicked has a class of bad so let's remove it and add the good class
                document.getElementById(_idInputMapper[indexError]).classList.add('error-card-form');
            }
            if (document.getElementById(_idInputMapper[indexError]).classList.contains('default-card-form')) {
                document.getElementById(_idInputMapper[indexError]).classList.remove('default-card-form');
            }


            // document.getElementById(_idInputMapper[indexError]).setAttribute('style', 'color:#ff0000 !important');

        }
    };

    /**
     *
     * @param idElement
     * @param s
     * @param fn
     * @private
     */
    var _addListenerMulti = function (idElement, s, fn) {
        var eventList = s.split(' ');
        for(var eventIndex = 0; eventIndex < eventList.length; eventIndex++) {
            document.getElementById(idElement).addEventListener(eventList[eventIndex], function (e) {fn();},false);
        }
    };

    /**
     *
     * @param idElement
     * @private
     */
    var _initListenEvent = function(idElement){
        _addListenerMulti(idElement, 'keydown keypress blur focus', _initErrorHandler);
    };



    // var _replacePlaceholderLikeBlur = function(idElement, stringPlaceholderLike) {
    //     if (document.getElementById(idElement).value == "") {
    //         document.getElementById(idElement).value = stringPlaceholderLike;
    //     }
    //
    // }
    // var _replacePlaceholderLikeFocus = function(idElement, stringPlaceholderLike) {
    //     if (document.getElementById(idElement).value == stringPlaceholderLike) {
    //         document.getElementById(idElement).value = "";
    //     }
    //
    // }

    var _initPlaceholder = function() {
        for (var propt in _idInputMapper) {

            if (document.getElementById(_idInputMapper[propt]).placeholder == "") {
                switch (propt) {
                    case 'cardNumber':
                        document.getElementById(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER");
                        break;
                    case 'cardHolder':
                        document.getElementById(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_HOLDER");
                        break;
                    case 'cardExpiryDate':
                        document.getElementById(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_EXPIRY_DATE");
                        break;
                    case 'cardCVV':
                        document.getElementById(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV");
                        break;
                }
            } else {
                // console.log('no placeholder');
                // switch (propt) {
                //     case 'cardNumber':
                //         document.getElementById(_idInputMapper[propt]).value = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER");
                //         if (document.getElementById(_idInputMapper[propt]).attachEvent) {
                //             document.getElementById(_idInputMapper[propt]).attachEvent("onblur", _replacePlaceholderLikeBlur(_idInputMapper[propt],_getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")));
                //             document.getElementById(_idInputMapper[propt]).attachEvent("onfocus", _replacePlaceholderLikeFocus(_idInputMapper[propt],_getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")));
                //         } else {
                //             document.getElementById(_idInputMapper[propt]).addEventListener ("blur", _replacePlaceholderLikeBlur(_idInputMapper[propt], _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")), false);  // all browsers and IE9+
                //             document.getElementById(_idInputMapper[propt]).addEventListener ("focus", _replacePlaceholderLikeFocus(_idInputMapper[propt], _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")), false);  // all browsers and IE9+
                //         }
                //
                //
                //         break;
                //     case 'cardHolder':
                //         document.getElementById(_idInputMapper[propt]).value = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_HOLDER");
                //         if (document.getElementById(_idInputMapper[propt]).attachEvent) {
                //             document.getElementById(_idInputMapper[propt]).attachEvent("onblur", _replacePlaceholderLikeBlur(_idInputMapper[propt],_getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")));
                //             document.getElementById(_idInputMapper[propt]).attachEvent("onfocus", _replacePlaceholderLikeFocus(_idInputMapper[propt],_getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")));
                //         } else {
                //             document.getElementById(_idInputMapper[propt]).addEventListener ("blur", _replacePlaceholderLikeBlur(_idInputMapper[propt], _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")), false);  // all browsers and IE9+
                //             document.getElementById(_idInputMapper[propt]).addEventListener ("focus", _replacePlaceholderLikeFocus(_idInputMapper[propt], _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER")), false);  // all browsers and IE9+
                //         }
                //         break;
                //     case 'cardExpiryDate':
                //         document.getElementById(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_EXPIRY_DATE");
                //         break;
                //     case 'cardCVV':
                //         document.getElementById(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV");
                //         break;
                // }


            }
        }
    };



    /* add listener on all input form */
    window.onload = function() {

        // HiPay.Form.setLocale("en_EN");

        // create ico card type
        // card type
        var my_elem = document.getElementById(_idInputMapper.cardNumber);

        var imgType = document.createElement('img');
        // span.innerHTML = '*';
        imgType.className = 'asterisk';
        imgType.id = _idInputMapper['cardType'];
        imgType.src = undefined;
        imgType.setAttribute('style','display:none;');

        my_elem.parentNode.insertBefore(imgType, my_elem.nextSibling);

        // add placeholder
        _initPlaceholder();


        for(var propt in _idInputMapper){


            if (propt == 'cardNumber') {


                // var handlerInput = function(e) {
                //     console.log('oninput');
                //         var evt = e || window.event;
                //         var charCode = evt.keyCode || evt.which;
                //         if (charCode == 8 || charCode == 46) {
                //
                //             // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                //             _instanceServiceCreditCard = new _serviceCreditCard();
                //             _instanceServiceCreditCard.initCreditCardNumber(charCode);
                //             evt.preventDefault();
                //             // _callbackEventFormChange();
                //         } else {
                //             // evt.preventDefault();
                //         }
                //
                //         _callbackEventFormChange();
                //
                //     // _callbackEventFormChange();
                // };
                //
                // if (document.getElementById(_idInputMapper['cardNumber']).attachEvent) {
                //     document.getElementById(_idInputMapper['cardNumber']).attachEvent("oninput", handlerInput);
                // } else {
                //     document.getElementById(_idInputMapper['cardNumber']).addEventListener ("input", handlerInput, false);  // all browsers and IE9+
                // }




                // keydown

                // document.getElementById(_idInputMapper['cardNumber']).addEventListener('keydown', function (e) {

                var handlerKeydown = function(e) {
                    evt = e || window.event;
                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {

                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardNumber(charCode);
                        evt.preventDefault();
                        // _callbackEventFormChange();
                    } else {
                        // evt.preventDefault();
                    }

                    _callbackEventFormChange();

                    // HiPay.Form.paymentFormDataGetErrors();

                };
                // });



                if (document.getElementById(_idInputMapper['cardNumber']).attachEvent) {
                    document.getElementById(_idInputMapper['cardNumber']).attachEvent("onkeydown", handlerKeydown);
                } else {
                    document.getElementById(_idInputMapper['cardNumber']).addEventListener ("keydown", handlerKeydown, false);  // all browsers and IE9+
                }

                // ./ keydown



                // paste
                var handlerPaste = function(e) {

                    var evt = e || window.event;

                    var pastedText = "";
                    if (window.clipboardData) {
                        pastedText = window.clipboardData.getData('Text');

                    } else if(evt.clipboardData && evt.clipboardData.getData) {
                        pastedText = e.clipboardData.getData('text/plain');
                    }

                    evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);

                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardNumber("",pastedText);

                    _callbackEventFormChange();
                };
                if (document.getElementById(_idInputMapper['cardNumber']).attachEvent) {
                    document.getElementById(_idInputMapper['cardNumber']).attachEvent("onpaste", handlerPaste);
                } else {
                    document.getElementById(_idInputMapper['cardNumber']).addEventListener ("paste", handlerPaste, false);  // all browsers and IE9+
                }

                // ./ paste

                document.getElementById(_idInputMapper['cardNumber']).addEventListener('keypress', function (e) {
                    // return false;
                    evt = e || window.event;


                    var charCode = evt.keyCode || evt.which;

                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardNumber(charCode);
                    }

                    _callbackEventFormChange();

                });









                _initListenEvent(_idInputMapper[propt]);

            }
            else if (propt == 'cardHolder') {

                document.getElementById(_idInputMapper[propt]).addEventListener('keydown', function (e) {


                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardHolder(charCode);
                        evt.preventDefault();

                    } else {


                    }
                    _callbackEventFormChange();




                });

                document.getElementById(_idInputMapper[propt]).addEventListener('keypress', function (e) {

                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;

                    if (charCode == 8 || charCode == 46) {

                    } else {

                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardHolder(charCode);
                        evt.preventDefault();
                    }
                    _callbackEventFormChange();
                });



            }
            else if (propt == 'cardExpiryDate') {

                document.getElementById(_idInputMapper[propt]).addEventListener('keydown', function (e) {


                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);
                        evt.preventDefault();
                    } else {

                    }
                    _callbackEventFormChange();



                });

                document.getElementById(_idInputMapper[propt]).addEventListener('keypress', function (e) {

                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {

                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);

                    }
                    _callbackEventFormChange();
                });


                // paste
                var handlerExpiryDate = function(e) {
                    var evt = e || window.event;

                    var pastedText = "";
                    if (window.clipboardData) {
                        pastedText = window.clipboardData.getData('Text');
                    } else if(evt.clipboardData && evt.clipboardData.getData) {
                        pastedText = e.clipboardData.getData('text/plain');

                    }

                    evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);

                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardExpiryDate("",pastedText);

                    _callbackEventFormChange();
                };
                if (document.getElementById(_idInputMapper[propt]).attachEvent) {
                    document.getElementById(_idInputMapper[propt]).attachEvent("onpaste", handlerExpiryDate);
                } else {
                    document.getElementById(_idInputMapper[propt]).addEventListener ("paste", handlerExpiryDate, false);  // all browsers and IE9+
                }

                // ./ paste




            }

            else if (propt == 'cardCVV') {

                document.getElementById(_idInputMapper['cardCVV']).addEventListener('keydown', function (e) {
                    var evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardCVV(charCode);
                        evt.preventDefault();

                    }
                    _callbackEventFormChange();
                });

                document.getElementById(_idInputMapper['cardCVV']).addEventListener('keypress', function (e) {

                    var evt = e || window.event;


                    var charCode = evt.keyCode || evt.which;

                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */

                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardCVV(charCode);
                    }
                    _callbackEventFormChange();
                });


                // paste
                var handlerExpiryDatePaste = function(e) {
                    var evt = e || window.event;

                    var pastedText = "";
                    if (window.clipboardData) {
                        pastedText = window.clipboardData.getData('Text');

                    } else if(evt.clipboardData && evt.clipboardData.getData) {
                        pastedText = e.clipboardData.getData('text/plain');
                    }

                    evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);

                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardCVV("",pastedText);

                    _callbackEventFormChange();
                };
                if (document.getElementById(_idInputMapper[propt]).attachEvent) {
                    document.getElementById(_idInputMapper[propt]).attachEvent("onpaste", handlerExpiryDatePaste);
                } else {
                    document.getElementById(_idInputMapper[propt]).addEventListener ("paste", handlerExpiryDatePaste, false);  // all browsers and IE9+
                }
                // ./ paste



                // document.getElementById(_idInputMapper['cardCVV']).addEventListener('blur', function (e) {
                //     _instanceServiceCreditCard = new _serviceCreditCard();
                //     var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
                // });
            }
            else {
            }

            document.getElementById(_idInputMapper[propt]).addEventListener('blur', function (e) {
                _callbackEventFormChange();

            });
            _initListenEvent(_idInputMapper[propt]);

        }


    };

    /**
     *
     * @returns {{card_number, card_expiry_month: string, card_expiry_year: string, card_holder, cvv, multi_use: string, generate_request_id: string}}
     * @private
     */
    var _getParamsFromForm = function() {
        var creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;


        var explodeExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);



        var month = "";
        var year = "";
        if (explodeExpiryDate.length == 2) {
            month = explodeExpiryDate[0];


            year = explodeExpiryDate[1];

        } else {
            month = explodeExpiryDate[0];
        }
        return  {
            card_number: document.getElementById(_idInputMapper.cardNumber).value,
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: document.getElementById(_idInputMapper.cardHolder).value,
            cvv: document.getElementById(_idInputMapper.cardCVV).value,
            multi_use: '0',
            generate_request_id: '0'
        };
    };

    /**
     *
     * @returns {{type: *, length: *}}
     */


    /**
     * CVV information by card (name and length of CVV)
     * @method HiPay.getCVVInformation
     * @return {object}
     */
    HiPay.getCVVInformation = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();

        var CVVLength = _instanceServiceCreditCard.getCreditCardCVVLengthMax();
        if (CVVLength == undefined) {
            CVVLength = 3;
        }

        var idType = _instanceServiceCreditCard.getTypeWithCardNumber(_instanceServiceCreditCard.getCreditCardNumberValue());
        return {type:_idCVVMapper[idType],
            length: CVVLength};
    }

    /**
     * Get errors in form
     *
     * @method HiPay.Form.paymentFormDataGetErrors
     * @return errorCollection
     */
    HiPay.Form.paymentFormDataGetErrors = function() {

        _instanceServiceCreditCard = new _serviceCreditCard();
        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();
        var params = _getParamsFromForm();
        var errorCollection = {};
        var hasError = false;
        // Credit card number
        var validatorCreditCardNumber = _instanceServiceCreditCard.validatorCreditCardNumber();
        var creditCardNumberUnformatted = _instanceServiceCreditCard.unformatCreditCardNumber(params['card_number']);

        if (creditCardNumberUnformatted != "") {

            if (!validatorCreditCardNumber.isPotentiallyValid(creditCardNumberUnformatted) ||
                (!validatorCreditCardNumber.isValid(creditCardNumberUnformatted) && document.getElementById(_idInputMapper.cardNumber) !== document.activeElement )
            ) {
                errorCollection['cardNumber'] = validatorCreditCardNumber.errorCollection[0]['message'];
            }
        }




        // Credit card holder
        var validatorCreditCardHolder = _instanceServiceCreditCard.validatorCreditCardHolder();
        var creditCardHolderString = params['card_holder'];

        if (creditCardHolderString != "") {
            if (!validatorCreditCardHolder.isPotentiallyValid(creditCardHolderString) ||
                (!validatorCreditCardHolder.isValid(creditCardHolderString) && document.getElementById(_idInputMapper.cardHolder) !== document.activeElement )
            ) {
                errorCollection['cardHolder'] = validatorCreditCardHolder.errorCollection[0]['message'];
            }
        }

        // Credit card expiry date
        var validatorCreditCardExpiryDate = _instanceServiceCreditCard.validatorCreditCardExpiryDate();
        var creditCardExpiryDateString = params['card_expiry_month'];
        if (params['card_expiry_year'] != "") {
            creditCardExpiryDateString +=  _separatorMonthYear + params['card_expiry_year'];
        }

        if (creditCardExpiryDateString != "") {
            if (!validatorCreditCardExpiryDate.isPotentiallyValid(creditCardExpiryDateString) ||
                (!validatorCreditCardExpiryDate.isValid(creditCardExpiryDateString) && document.getElementById(_idInputMapper.cardExpiryDate) !== document.activeElement )
            ) {
                errorCollection['cardExpiryDate'] = validatorCreditCardExpiryDate.errorCollection[0]['message'];
            }
        }



// Credit card security code
        var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
        var creditCardCVVString = params['cvv'];
        if (creditCardCVVString != "") {
            if (!validatorCreditCardCVV.isPotentiallyValid(creditCardCVVString,creditCardNumberUnformatted) ||
                (!validatorCreditCardCVV.isValid(creditCardCVVString) && document.getElementById(_idInputMapper.cardCVV) !== document.activeElement )
            ) {
                errorCollection['cardCVV'] = validatorCreditCardCVV.errorCollection[0]['message'];
            }
        }


        return errorCollection;

    };

    /**
     * Callback on form change
     *
     * @method HiPay.Form.change
     * @parameter {function} callback
     *
     */
    HiPay.Form.change = function(callback) {
        _callbackEventFormChange = callback;
    };

    /**
     * Is valid form data.
     *
     * @method HiPay.Form.paymentFormDataIsValid
     * @return {Boolean} Form is or is not valid
     *
     */
    HiPay.Form.paymentFormDataIsValid = function() {


        var params = {
            card_number: $('#input-card')[0].value,
            card_holder: $('#input-name')[0].value,
            cvc: $('#input-cvv')[0].value,
            card_expiry_date: $('#input-expiry-date')[0].value,

            multi_use: '0'
        };


        if (!_instanceServiceCreditCard) {

            _instanceServiceCreditCard = new _serviceCreditCard();
        }

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        return validatorCreditCard.isValid(params);
    }

    /**
     *
     * @param instance
     * @param payload
     * @param specialValueCallback
     * @private
     */
    var _processObjectPayload = function (instance, payload, specialValueCallback) {
        var propertyConfig = [];

        for (var key in payload || {}) {

            if (typeof instance._mapping === 'object') {

                var mapping = instance._mapping[key];

                if (typeof mapping === 'object') {
                    value = typeof specialValueCallback !== 'undefined' ? (specialValueCallback(key, payload[key]) || payload[key]) : payload[key];

                    // Property is writable, value can directly be set
                    if (!_canDefineProperty || mapping.propertyDescriptors.writable) {
                        instance[mapping.name] = value;
                    }

                    // Property not writable, should be redefined
                    else {
                        propertyConfig[mapping.name] =_extend({}, mapping.propertyDescriptors, {
                            value: value,
                            configurable: true // Values might be refreshed later
                        });

                    }
                }
            }
        }

        if (_canDefineProperty) {
            Object.defineProperties(instance, propertyConfig);
        }
    };

    // IE classlist
    if(Object.defineProperty && isIE() < 10) {
        Object.defineProperty(Element.prototype, 'classList', {
            // _defineProperties(Element.prototype, 'classList', {
            get: function () {
                var self = this, bValue = self.className.split(" ")

                bValue.add = function () {
                    var b;
                    for (i in arguments) {
                        b = true;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] == arguments[i]) {
                                b = false
                                break
                            }
                        if (b)
                            self.className += (self.className ? " " : "") + arguments[i]
                    }
                }
                bValue.remove = function () {
                    self.className = ""
                    for (i in arguments)
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] != arguments[i])
                                self.className += (self.className ? " " : "") + bValue[j]
                }
                bValue.toggle = function (x) {
                    var b;
                    if (x) {
                        self.className = ""
                        b = false;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] != x) {
                                self.className += (self.className ? " " : "") + bValue[j]
                                b = false
                            } else b = true
                        if (!b)
                            self.className += (self.className ? " " : "") + x
                    } else throw new TypeError("Failed to execute 'toggle': 1 argument required")
                    return !b;
                }
                bValue.contains = function () {
                    var b;
                    for (i in arguments) {
                        b = false;
                        for (var j = 0; j < bValue.length; j++)
                            if (bValue[j] == arguments[i]) {
                                b = true
                                break
                            }

                        return b;
                    }
                }

                return bValue;
            },
            enumerable: true,
            configurable: true
        });

    }




    /**
     *
     * @type {{APIIncorrectCredentials: number, APIIncorrectSignature: number, APIAccountNotActive: number, APIAccountLocked: number, APIInsufficientPermissions: number, APIForbiddenAccess: number, APIUnsupportedVersion: number, APITemporarilyUnavailable: number, APINotAllowed: number, APIMethodNotAllowedGateway: number, APIInvalidParameter: number, APIMethodNotAllowedSecureVault: number, APIInvalidCardToken: number, APIRequiredParameterMissing: number, APIInvalidParameterFormat: number, APIInvalidParameterLength: number, APIInvalidParameterNonAlpha: number, APIInvalidParameterNonNum: number, APIInvalidParameterNonDecimal: number, APIInvalidDate: number, APIInvalidTime: number, APIInvalidIPAddress: number, APIInvalidEmailAddress: number, APIInvalidSoftDescriptorCodeMessage: number, APINoRouteToAcquirer: number, APIUnsupportedECIDescription: number, APIUnsupported: number, APIUnknownOrder: number, APIUnknownTransaction: number, APIUnknownMerchant: number, APIUnsupportedOperation: number, APIUnknownIPAddress: number, APISuspicionOfFraud: number, APIFraudSuspicion: number, APIUnknownToken: number, APILuhnCheckFailed: number, APIUnsupportedCurrency: number, APIAmountLimitExceeded: number, APIMaxAttemptsExceeded: number, APIDuplicateOrder: number, APICheckoutSessionExpired: number, APIOrderCompleted: number, APIOrderExpired: number, APIOrderVoided: number, APIAuthorizationExpired: number, APIAllowableAmountLimitExceeded: number, APINotEnabled: number, APINotAllowedCapture: number, APINotAllowedPartialCapture: number, APIPermissionDenied: number, APICurrencyMismatch: number, APIAuthorizationCompleted: number, APINoMore: number, APIInvalidAmount: number, APIAmountLimitExceededCapture: number, APIAmountLimitExceededPartialCapture: number, APIOperationNotPermittedClosed: number, APIOperationNotPermittedFraud: number, APIRefundNotEnabled: number, APIRefundNotAllowed: number, APIPartialRefundNotAllowed: number, APIRefundPermissionDenied: number, APIRefundCurrencyMismatch: number, APIAlreadyRefunded: number, APIRefundNoMore: number, APIRefundInvalidAmount: number, APIRefundAmountLimitExceeded: number, APIRefundAmountLimitExceededPartial: number, APIOperationNotPermitted: number, APITooLate: number, APIReauthorizationNotEnabled: number, APIReauthorizationNotAllowed: number, APICannotReauthorize: number, APIMaxLimitExceeded: number, APIVoidNotAllowed: number, APICannotVoid: number, APIAuthorizationVoided: number, APIDeclinedAcquirer: number, APIDeclinedFinancialInstituion: number, APIInsufficientFundsAccount: number, APITechnicalProblem: number, APICommunicationFailure: number, APIAcquirerUnavailable: number, APIDuplicateTransaction: number, APIPaymentCancelledByTheCustomer: number, APIInvalidTransaction: number, APIPleaseCallTheAcquirerSupportCallNumber: number, APIAuthenticationFailedPleaseRetryOrCancel: number, APINoUIDConfiguredForThisOperation: number, APIRefusalNoExplicitReason: number, APIIssuerNotAvailable: number, APIInsufficientFundsCredit: number, APITransactionNotPermitted: number, APIInvalidCardNumber: number, APIUnsupportedCard: number, APICardExpired: number, APIExpiryDateIncorrect: number, APICVCRequired: number, APICVCError: number, APIAVSFailed: number, APIRetainCard: number, APILostOrStolenCard: number, APIRestrictedCard: number, APICardLimitExceeded: number, APICardBlacklisted: number, APIUnauthorisedIPAddressCountry: number, APICardnotInAuthorisersDatabase: number}}
     */
    HiPay.ErrorReason = {
        APIIncorrectCredentials: 1000001,
        APIIncorrectSignature: 1000002,
        APIAccountNotActive: 1000003,
        APIAccountLocked: 1000004,
        APIInsufficientPermissions: 1000005,
        APIForbiddenAccess: 1000006,
        APIUnsupportedVersion: 1000007,
        APITemporarilyUnavailable: 1000008,
        APINotAllowed: 1000009,
        APIMethodNotAllowedGateway: 1010001,
        APIInvalidParameter: 1010002,
        APIMethodNotAllowedSecureVault: 1010003,
        APIInvalidCardToken: 1012003,
        APIRequiredParameterMissing: 1010101,
        APIInvalidParameterFormat: 1010201,
        APIInvalidParameterLength: 1010202,
        APIInvalidParameterNonAlpha: 1010203,
        APIInvalidParameterNonNum: 1010204,
        APIInvalidParameterNonDecimal: 1010205,
        APIInvalidDate: 1010206,
        APIInvalidTime: 1010207,
        APIInvalidIPAddress: 1010208,
        APIInvalidEmailAddress: 1010209,
        APIInvalidSoftDescriptorCodeMessage: 1010301,
        APINoRouteToAcquirer: 1020001,
        APIUnsupportedECIDescription: 1020002,
        APIUnsupported: 1020003,

        // Validation errors
        APIUnknownOrder: 3000001,
        APIUnknownTransaction: 3000002,
        APIUnknownMerchant: 3000003,
        APIUnsupportedOperation: 3000101,
        APIUnknownIPAddress: 3000102,
        APISuspicionOfFraud: 3000201,
        APIFraudSuspicion: 3040001,
        APIUnknownToken: 3030001,
        APILuhnCheckFailed: 409,

        // Error codes relating to the Checkout Process
        APIUnsupportedCurrency: 3010001,
        APIAmountLimitExceeded: 3010002,
        APIMaxAttemptsExceeded: 3010003,
        APIDuplicateOrder: 3010004,
        APICheckoutSessionExpired: 3010005,
        APIOrderCompleted: 3010006,
        APIOrderExpired: 3010007,
        APIOrderVoided: 3010008,

        // Error codes relating to Maintenance Operations
        APIAuthorizationExpired: 3020001,
        APIAllowableAmountLimitExceeded: 3020002,
        APINotEnabled: 3020101,
        APINotAllowedCapture: 3020102,
        APINotAllowedPartialCapture: 3020103,
        APIPermissionDenied: 3020104,
        APICurrencyMismatch: 3020105,
        APIAuthorizationCompleted: 3020106,
        APINoMore: 3020107,
        APIInvalidAmount: 3020108,
        APIAmountLimitExceededCapture: 3020109,
        APIAmountLimitExceededPartialCapture: 3020110,
        APIOperationNotPermittedClosed: 3020111,
        APIOperationNotPermittedFraud: 3020112,
        APIRefundNotEnabled: 3020201,
        APIRefundNotAllowed: 3020202,
        APIPartialRefundNotAllowed: 3020203,
        APIRefundPermissionDenied: 3020204,
        APIRefundCurrencyMismatch: 3020205,
        APIAlreadyRefunded: 3020206,
        APIRefundNoMore: 3020207,
        APIRefundInvalidAmount: 3020208,
        APIRefundAmountLimitExceeded: 3020209,
        APIRefundAmountLimitExceededPartial: 3020210,
        APIOperationNotPermitted: 3020211,
        APITooLate: 3020212,
        APIReauthorizationNotEnabled: 3020301,
        APIReauthorizationNotAllowed: 3020302,
        APICannotReauthorize: 3020303,
        APIMaxLimitExceeded: 3020304,
        APIVoidNotAllowed: 3020401,
        APICannotVoid: 3020402,
        APIAuthorizationVoided: 3020403,

        // Acquirer Reason Codes
        APIDeclinedAcquirer: 4000001,
        APIDeclinedFinancialInstituion: 4000002,
        APIInsufficientFundsAccount: 4000003,
        APITechnicalProblem: 4000004,
        APICommunicationFailure: 4000005,
        APIAcquirerUnavailable: 4000006,
        APIDuplicateTransaction: 4000007,
        APIPaymentCancelledByTheCustomer: 4000008,
        APIInvalidTransaction: 4000009,
        APIPleaseCallTheAcquirerSupportCallNumber: 4000010,
        APIAuthenticationFailedPleaseRetryOrCancel: 4000011,
        APINoUIDConfiguredForThisOperation: 4000012,
        APIRefusalNoExplicitReason: 4010101,
        APIIssuerNotAvailable: 4010102,
        APIInsufficientFundsCredit: 4010103,
        APITransactionNotPermitted: 4010201,
        APIInvalidCardNumber: 4010202,
        APIUnsupportedCard: 4010203,
        APICardExpired: 4010204,
        APIExpiryDateIncorrect: 4010205,
        APICVCRequired: 4010206,
        APICVCError: 4010207,
        APIAVSFailed: 4010301,
        APIRetainCard: 4010302,
        APILostOrStolenCard: 4010303,
        APIRestrictedCard: 4010304,
        APICardLimitExceeded: 4010305,
        APICardBlacklisted: 4010306,
        APIUnauthorisedIPAddressCountry: 4010307,
        APICardnotInAuthorisersDatabase: 4010309
    }

    /**
     *
     * @param responseJSON
     * @constructor
     */
    HiPay.Token = function (responseJSON) {
        var payload;
        if (typeof responseJSON.data !== 'undefined') {
            payload = responseJSON.data;
        }
        if (typeof payload === 'object') {
            _processObjectPayload(this, $.extend({}, payload, {
                token: payload.token
            }));
        } else {
            _processObjectPayload(this, $.extend({}, payload, {
                token: payload.token
            }));
        }
    };

    /**
     *
     * @constructor
     */
    HiPay.Token = function() {
        _bootstrapInstanceProperties(this);
    };

    /**
     *
     * @param context
     * @param payload
     * @returns {*}
     */
    HiPay.Token.populateProperties = function (context, payload) {
        _processObjectPayload(context, payload,  function (key, val){
            // switch (key) {
            // case 'token':
            //     break;
            // }
        });
        return context;
    };
    /**
     *
     * @param target
     */
    HiPay.setTarget = function(target) {
        HiPay.target = target;
        _initListPaymentMethod();
    };

    /**
     *
     * @returns {*}
     */
    HiPay.getTarget = function() {
        return HiPay.target;
    };

    /**
     *
     * @param username
     * @param publicKey
     */
    HiPay.setCredentials = function(username, publicKey) {
        HiPay.username = username;
        HiPay.publicKey = publicKey;

        _initListPaymentMethod();
    };


    var _availablePaymentProductsCustomerCountry = "";
    var _availablePaymentProductsCurrency = "";

    var _customPaymentProducts = [];
    // var _availablePaymentProductsCodeCollection = ["cb", "visa", "mastercard", "american-express", "carte-accord", "bcmc", "maestro", "postfinance-card", "bcmc-mobile", "dexia-directnet", "giropay", "ideal", "ing-homepay", "sofort-uberweisung", "sisal", "sdd", "paypal", "yandex", "payulatam", "paysafecard"];
    var _availablePaymentProductsCollection = [];
    var _availableAndEnabledPaymentProductsCollection = [];

    HiPay.setAvailalblePaymentProductsCustomerCountry = function(countryISO2) {
        _availablePaymentProductsCustomerCountry = countryISO2;
        _initListPaymentMethod();
    }

    HiPay.setAvailalblePaymentProductsCurrency = function(currency) {
        _availablePaymentProductsCurrency = currency;
        _initListPaymentMethod();
    }

    HiPay.enabledPaymentProducts = function(collectionPaymentProducts) {
        _customPaymentProducts = collectionPaymentProducts;
        _initListPaymentMethod();
    }

    // HiPay.getFormCC = function(containerId) {
    //
    //     var containerHtml = document.getElementById(containerId);
    //
    //
    //     if (!containerHtml) {
    //         return false;
    //     }
    //
    //     containerHtml.innerHTML += '<div style="margin-top: 50px">'
    //         + '<div id="my-card-1" class="card-js" data-capture-name="true" data-icon-colour="#158CBA"></div>'
    //         + '</div>';
    //
    // }


    // API Calls

    var _makeRequest = function(opts) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            if (opts.headers) {
                Object.keys(opts.headers).forEach(function (key) {
                    xhr.setRequestHeader(key, opts.headers[key]);
                });
            }
            var params = opts.params;
            // We'll need to stringify if we've been given an object
            // If we have a string, this is skipped.
            if (params && typeof params === 'object') {
                params = Object.keys(params).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');
            }
            xhr.send(params);
        });
    };


    function _disableAllInput() {
        for(var propt in _idInputMapper){
            document.getElementById(_idInputMapper[propt]).disabled = true;
        }
    }

    function _enableAllInput() {
        for(var propt in _idInputMapper){
            document.getElementById(_idInputMapper[propt]).disabled = false;
        }
    }

    /**
     *
     * @param endpoint
     * @param requestParams
     * @param returnPromise
     * @param checkKey
     * @returns {Promise}
     * @private
     */
    var _performAPICall = function (endpoint, requestParams, returnPromise, checkKey) {
        if ((typeof checkKey === 'undefined' || checkKey) && (typeof HiPay.publicKey === 'undefined' || typeof HiPay.username === 'undefined')) {
            throw new _Error('missing_public_key', 'You have to provide a HiPay username and public key in order to perform API calls.');
            // {"code":'+APIInvalidCardToken+',
        }

        try{
            var authEncoded = window.btoa(HiPay.username + ':' + HiPay.publicKey);
        }catch(e) {
            throw new _Error('missing_public_key');
        }

        // Ne fonctionne pas avec IE 10 ?
        if ('XDomainRequest' in window && window.XDomainRequest !== null && isIE() != 10) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey);
        }

        var config = {
            headers: {
                'Authorization': 'Basic ' + authEncoded,
                // 'contentType': 'application/json'
                // 'Accept': 'application/json',
                // 'Content-Type': 'application/json'
                // 'Accept': 'application/json, text/plain, */*',
                // 'Access-Control-Origin': '*',
                'Content-Type': 'application/json'
            }
        };

        // axios.post("http://localhost:8080/example/index5.php",{key: 'value'})
        //     .then(function (response) {

        //     })
        //     .catch(function (error) {

        //     });




        // if (isIE () == 8) {
        //     // IE8 code
        // } else {
        //     // Other versions IE or not IE
        // }
        //

        // if (isIE () && isIE () < 9) {
        //     var xdr;
        //     function err() {

        //     }
        //     function timeo() {

        //     }
        //     function loadd() {

        //     }
        //     function stopdata() {
        //         xdr.abort();
        //     }
        //
        //     xdr = new XDomainRequest();
        //     if (xdr) {
        //         xdr.onerror = err;
        //         xdr.ontimeout = timeo;
        //         xdr.onload = loadd;
        //         xdr.timeout = 10000;
        //         xdr.open('POST',endpoint);
        //         xdr.send(requestParams);
        //         xdr.header(config);
        //         //xdr.send('foo=<?php echo $foo; ?>'); to send php variable
        //     } else {

        //     }
        // } else {
        // is IE 9 and later or not IE


        //
        // var endpoint = 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
        // if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
        //     endpoint = 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
        // } else if (HiPay.getTarget() == 'dev') {
        //     endpoint = 'http://dev-secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
        // }
        //
        // if (!("generate_request_id" in params)) {
        //     params['generate_request_id'] = 0;
        // }











        // console.info(requestParams);
//             var createCORSRequest = function(method, url) {
//                 var xhr = new XMLHttpRequest();
//                 if ("withCredentials" in xhr) {

//                     // Most browsers.
//                     xhr.open(method, url, true);
//                 } else if (typeof XDomainRequest != "undefined") {
//                     // IE8 & IE9

//                     xhr = new XDomainRequest();
//                     xhr.open(method, url);
//                 } else {
//                     // CORS not supported.
//                     xhr = null;
//                 }
//                 return xhr;
//             };
//
//             // var url = 'http://server.test-cors.org/server?id=6681318&enable=true&status=200&credentials=false';
//             var url = endpoint;
//             var method = 'POST';
//             var xhr = createCORSRequest(method, url);
//
//             xhr.onload = function() {
//                 // Success code goes here.
//             };
//
//             xhr.onerror = function() {
//                 // Error code goes here.
//             };
//
//             xhr.withCredentials = true;
//             xhr.send();



        // var url = "127.0.0.1";
        // xObj = new ActiveXObject("Microsoft.XMLHTTP");
        // if(xObj!=null)
        // {
        //     xObj.open("GET", url,false);
        //     xObj.send(null);
        // }

        // if (window.XDomainRequest) {
        //     var appliance = new XDomainRequest();
        //
        //
        //     appliance.onerror = err;
        //     appliance.ontimeout = timeo;
        //     appliance.onload = loadd;
        //     appliance.timeout = 10000;
        //     appliance.open('POST',endpoint);
        //     appliance.send(JSON.stringify(requestParams));
        //     appliance.header(config);
        //         //xdr.send('foo=<?php echo $foo; ?>'); to send php variable
        //
        //
        //
        //
        // }
        // else
//                 if (window.XMLHttpRequest) {
//                 var appliance = new XMLHttpRequest();
//
//                 appliance.onreadystatechange = function() {
//                     if (appliance.readyState === 4) {

//                         if (appliance.status === 200) {

//                             // success, use appliance.responseText
//                         } else {
//                             // error

//                         }
//                     }
//                 };
//                 appliance.open("POST", endpoint, true);
//                 // appliance.open("POST", 'http://localhost', true);
//                 appliance.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
//
//
// //
//                 appliance.setRequestHeader('Authorization', 'Basic ' + authEncoded);
//                 // appliance.withCredentials = true; // to support sending cookies with CORS
//                 // requestParams = {toto : 'toto'};
//                 appliance.send(JSON.stringify(requestParams));

        // }
        // else {
        //     var appliance = new ActiveXObject("Microsoft.XMLHTTP");
        // }


        // if (window.XMLHttpRequest) {
        //     //Firefox, Opera, IE7, and other browsers will use the native object
        //     var appliance = new XMLHttpRequest();
        // } else {
        //     //IE 5 and 6 will use the ActiveX control
        //     var appliance = new ActiveXObject("Microsoft.XMLHTTP");
        // }

//
//             // var appliance = new window.XMLHttpRequest();

// dump(appliance.getAllResponseHeaders());

        // return Promise(function(resolve, reject){
        //
        // });


        // return _makeRequest({
        //     method: 'POST',
        //     url: endpoint,
        //     params: requestParams,
        //     headers: config['headers']
        // });



        // return new Promise(function (resolve, reject) {
        //     axios.post(endpoint,requestParams,config)
        //         .then(function(responseJson) {
        //
        //             if( typeof responseJson['code'] != 'undefined' )  {
        //                 reject(new _APIError(responseJson));
        //             }
        //             else {
        //                 console.log("responseJson");
        //                 console.log(responseJson);
        //                 var cardToken = new HiPay.Token(responseJson);
        //                 cardToken.constructor.populateProperties(cardToken, responseJson.data);
        //                 resolve(cardToken);
        //             }
        //         }).catch(function (error) {
        //         reject(new _APIError(error));
        //
        //
        //
        //
        //
        //
        //
        //
        //
        //         // var appliance = new window.XDomainRequest();
        //         // appliance.onload = function() {
        //         //     // do something with appliance.responseText
        //         // };
        //         // appliance.onerror = function() {
        //         //     // error handling
        //         // };
        //         //
        //         // // (endpoint,requestParams,config
        //         // appliance.open("POST", endpoint, true);
        //         // appliance.send(requestParams);
        //
        //
        //         // returnPromise.reject(new _APIError(error));
        //     });
        // });







        return new Promise(function (resolve, reject) {

            fetch(endpoint, {
                method: 'POST',
                headers: config['headers'],
                body: JSON.stringify( requestParams )
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function (result) {
                    if( typeof result['code'] != 'undefined' )  {
                        reject(new _APIError(result));
                    }
                    else {
                        var cardToken = new HiPay.Token(result);
                        cardToken.constructor.populateProperties(cardToken,result);
                        _disableAllInput();
                        resolve(cardToken);

                    }

                })
                .catch(function (error) {
                    // retry call
                    fetch(endpoint, {
                        method: 'POST',
                        headers: config['headers'],
                        body: JSON.stringify( requestParams )
                    })
                        .then(function (response) {
                            return response.json();
                        })
                        .then(function (result) {
                            if( typeof result['code'] != 'undefined' )  {
                                reject(new _APIError(result));
                            }
                            else {
                                var cardToken = new HiPay.Token(result);
                                cardToken.constructor.populateProperties(cardToken,result);
                                _disableAllInput();
                                resolve(cardToken);

                            }

                        })
                        .catch(function (error) {
                            reject(new _APIError(error));

                        });

                });

        });

    };


var _initAvailableAndEnabledPaymentProductsCollection = function() {
    // _customPaymentProducts



    // _availableAndEnabledPaymentProductsCollection

    var _listEnabledPaymentProducts = [];
    _availableAndEnabledPaymentProductsCollection = [];
console.log('start available');

    if (_availablePaymentProductsCollection.length > 0) {
        console.log('start _availablePaymentProductsCollection');
        console.log(_availablePaymentProductsCollection);
        if (_customPaymentProducts.length > 0) {

            console.log('start _customPaymentProducts');
            for (productAvailableIndex in _availablePaymentProductsCollection) {


                for (productCustomIndex in _customPaymentProducts) {
                    console.log("productCodeCustom");
                    console.log(_customPaymentProducts[productCustomIndex]);
                    if (_customPaymentProducts[productCustomIndex] == _availablePaymentProductsCollection[productAvailableIndex]['code']) {
                        _availableAndEnabledPaymentProductsCollection.push(_availablePaymentProductsCollection[productAvailableIndex]['code']);
                    }
                }

                console.log("productCodeAvailable");

                // _availablePaymentProductsCollection
                console.log(_availablePaymentProductsCollection[productAvailableIndex]['code']);
                // _availableAndEnabledPaymentProductsCollection
                // _customPaymentProducts
                // _listAvailablePaymentProductsTemp

                // _listAvailablePaymentProducts.push()
            }
        } else {
            for (productAvailable in _availablePaymentProductsCollection) {
                _availableAndEnabledPaymentProductsCollection.push(_availablePaymentProductsCollection[productAvailableIndex]['code']);
            }

        }
    }
console.log("_availableAndEnabledPaymentProductsCollection");
console.log(_availableAndEnabledPaymentProductsCollection);
    // return _availableAndEnabledPaymentProductsCollection;


};



var _getAvailablePaymentProducts = function() {


    if (!HiPay.getTarget() || !HiPay.username || !HiPay.publicKey || !_availablePaymentProductsCustomerCountry || !_availablePaymentProductsCurrency) {
        return;
    }

    var endpoint = _endPointAvailablePaymentProducts['prod'];
    if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
        endpoint = _endPointAvailablePaymentProducts['stage'];
    } else if (HiPay.getTarget() == 'dev') {
        endpoint = 'http://localhost:8080/example/dev-api-token.php';
    }

console.log("_getAvailablePaymentProducts");
console.log(HiPay.username);
    // endpoint = endpoint + "?eci=7&payment_product=visa&payment_product_category_list=credit-card&customer_country=FR&currency=EUR";
    endpoint = endpoint + "?eci=7&customer_country="+_availablePaymentProductsCustomerCountry+"&currency=" + _availablePaymentProductsCurrency;
    // endpoint = endpoint + "accept_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Faccept&amount=60.0&authentication_indicator=0&cancel_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fcancel&city=Paris&country=FR&currency=EUR&decline_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fdecline&description=Un%20beau%20v%C3%AAtement.&display_selector=0&eci=7&email=client%40domain.com&exception_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fexception&firstname=Martin&gender=U&language=en_US&lastname=Dupont&long_description=Un%20tr%C3%A8s%20beau%20v%C3%AAtement%20en%20soie%20de%20couleur%20bleue.&multi_use=1&orderid=DEMO_59f08c099ca87&payment_product_category_list=ewallet%2Cdebit-card%2Crealtime-banking%2Ccredit-card&pending_url=hipay%3A%2F%2Fhipay-fullservice%2Fgateway%2Forders%2FDEMO_59f08c099ca87%2Fpending&recipientinfo=Employee&shipping=1.56&state=France&streetaddress2=Immeuble%20de%20droite&streetaddress=6%20Place%20du%20Colonel%20Bourgoin&tax=2.67&zipcode=75012";
    try{
        var authEncoded = window.btoa(HiPay.username+':'+HiPay.publicKey);
    }catch(e) {
        throw new _Error('missing_public_key');
    }

    console.log(authEncoded);
    var config = {
        headers: {
            'Authorization': 'Basic ' + authEncoded,
            // 'contentType': 'application/json'
            // 'Accept': 'application/json',
            // 'Content-Type': 'application/json'
            'Accept': 'application/json'
            // 'Access-Control-Origin': '*',
            // 'Content-Type': 'application/json'
        }
    };


    // var requestParams = {
    //     'currency' : "EUR"
    // };

    _loadPaymentProduct = true;

    return fetch(endpoint, {
        method: 'GET',
        headers: config['headers']
        // body: JSON.stringify( requestParams )
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function (availablePaymentProductsCollection) {
        console.log("availablePaymentProductsCollection toto");
        console.log(availablePaymentProductsCollection);
        _availablePaymentProductsCollection = availablePaymentProductsCollection;
        _loadPaymentProduct = false;
    })
        .catch(function (error) {
            _loadPaymentProduct = false;
            reject(new _APIError(error));

        });


};

    var _initListPaymentMethod = function() {

        console.log("init payment");

        _getAvailablePaymentProducts();






    };


    /**
     *
     * @param data
     * @private
     */
    var _APIError = function (data) {

        var payload;


        // dump(data.response.data);
        if (typeof data.response.data !== 'undefined') {
            payload = data.response.data;
        }

        if (typeof payload === 'object') {
            _processObjectPayload(this, $.extend({}, payload, {
                code: payload.code,
                message: payload.message,
                description: payload.description,
            }));
        } else {
            _processObjectPayload(this, $.extend({}, payload, {
                code: 'code',
                message: 'other',
                description: 'description'
            }));
        }
    };

    _APIError.prototype = new _Error();

    /**
     *
     * @param code
     * @param message
     * @private
     */

    // var _InvalidParametersError = function (code, message)
    function _InvalidParametersError(code, message)
    {
        _processObjectPayload(this, {
            type: 'invalid_parameters',
            code: code,
            message: message
        });
    };

    _InvalidParametersError.prototype = new _Error();


    /**
     *
     * @param errorCollection
     * @private
     */
    var _InvalidFormTokenizationError = function (errorCollection) {
        _processObjectPayload(this, {
            type: 'invalid_cc_form',
            errorCollection: errorCollection
        });
    };

    _InvalidFormTokenizationError.prototype = new _Error();


    _defineProperties(HiPay.Token, {
        token: {name: 'token'},
        requestId: {name: 'request_id'},
        brand: {name: 'brand'},
        pan: {name: 'pan'},
        cardHolder: {name: 'card_holder'},
        cardExpiryMonth: {name: 'card_expiry_month'},
        cardExpiryYear: {name: 'card_expiry_year'},
        issuer: {name: 'issuer'},
        country: {name: 'country'},
        cardType: {name: 'card_type'}
    });



    _defineProperties(_APIError, {
        code: {name: 'code'},
        message: {name: 'message'},

    });


    _defineProperties(_InvalidParametersError, {
        code: {name: 'code'},
        message: {name: 'message'},
        server_response: {name: 'serverResponse'}
    });


    _defineProperties(_InvalidFormTokenizationError, {
        code: {name: 'code'},
        message: {name: 'message'},
        errorCollection: {name: 'errorCollection'},
        server_response: {name: 'serverResponse'}
    });

    /**
     * Get a token with credit card information.
     *
     * @method HiPay.tokenize
     * @param {String} cardNumber
     * @param {String} expiryMonth
     * @param {String} expiryYear
     * @param {String} cardHolder
     * @param {String} cvv
     * @param {Boolean} multiUse
     * @param {Boolean} generateRequestId
     *
     */
    HiPay.tokenize = function(cardNumber, expiryMonth, expiryYear, cardHolder, cvv, multiUse, generateRequestId) {


        var params = {
            card_expiry_month: expiryMonth,
            card_expiry_year: expiryYear,
            card_number: cardNumber,
            card_holder: cardHolder,
            cvc: cvv,
            multi_use: multiUse,
            generate_request_id: generateRequestId
        }


        var returnPromise = Promise;
        if(!_isBrowser()) {
            return returnPromise.reject(new _APIError('"message" : "cant tokenize on server side"}'));
        }

        if(params['card_expiry_month'].length < 2) {
            params['card_expiry_month'] = '0' + params['card_expiry_month'];
        }
        if( params['card_expiry_year'].length == 2) {
            params['card_expiry_year']  = '20' +  params['card_expiry_year'];
        }
        // var errorCollection = _isValidCCForm(params);

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        // var errorCollection = _isValidCCForm(params);

        // if (errorCollection.length > 0) {


        if (validatorCreditCard.isValid(params) === false) {
            // var errorCollection = _isValidCCForm(params);
            var errorCollection = validatorCreditCard.errorCollection;


            // var customError = new Error('Form error');
            var customError = new _InvalidFormTokenizationError(errorCollection);
            customError.errorCollection = errorCollection;
            return Promise.reject(customError);
        }

        else {
            var endpoint = _endPointTokenize['prod'];
            if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
                endpoint = _endPointTokenize['stage'];
            } else if (HiPay.getTarget() == 'dev') {
                endpoint = 'http://localhost:8080/example/dev-api-token.php';
            }

            if (!params['generate_request_id']) {
                params['generate_request_id'] = 0;
            }

            if (!params['multi_use']) {
                params['multi_use'] = 0;
            }

            var config = {
                headers: {'Authorization': 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey)}
            };

            return _performAPICall(endpoint, params, returnPromise);
        }
    };

    /**
     *
     * @param localeString
     */
    HiPay.Form.setLocale = function(localeString) {
        HiPay.Form.locale = localeString;

    };


    /**
     * Helper to display CVV information
     * @method HiPay.Form.CVVHelpText
     */
    HiPay.Form.CVVHelpText = function() {

        var serviceCreditCard = new _serviceCreditCard();
        var CVVLength = serviceCreditCard.getCreditCardCVVLengthMax();
        if (CVVLength == undefined) {
            CVVLength = 3;
        }
        return _translationJSON[HiPay.Form.locale]["FORM_CVV_"+CVVLength+"_HELP_MESSAGE"];

    };

    /**
     * Tokenize form data.
     * @method HiPay.Form.tokenizePaymentFormData
     */

    HiPay.Form.tokenizePaymentFormData = function() {

        if (!HiPay.Form.paymentFormDataIsValid()) {
            return false;
        }

        var creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;
        var explodeExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
        var month = explodeExpiryDate[0];
        var year = "20"+explodeExpiryDate[1];
        var params = {
            card_number: document.getElementById(_idInputMapper.cardNumber).value,
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: document.getElementById(_idInputMapper.cardHolder).value,
            cvv: document.getElementById(_idInputMapper.cardCVV).value,
            multi_use: '0',
            generate_request_id: '0'
        };
        return HiPay.tokenize(params['card_number'], params['card_expiry_month'], params['card_expiry_year'], params['card_holder'], params['cvv'], params['multi_use'], params['generate_request_id'] )
//

    }


    return HiPay;

} (HiPay || {}));