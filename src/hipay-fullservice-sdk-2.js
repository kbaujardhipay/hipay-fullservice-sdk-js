/**
 * HiPay Fullservice library
 */

var HiPay = (function (HiPay) {



    var HiPay = {};
    HiPay.Form = {};
    HiPay.Form.locale = "fr_FR";
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
        },


    };



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
    }


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

    }






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
    }

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




    // HiPay.ValidationError



    // var _validatorCC = function (errorCollection,serviceCC) {
    //
    //
    //
    //
    //
    //     var validatorCC = {};
    //
    //     var _cardLengthMin = '';
    //     var _cardLengthMax = '';
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //     validatorCC.errorCollection = errorCollection || [];
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //     return validatorCC;
    // };


    // var _fireEvent = function(element,event){
    //     if (document.createEventObject){
    //         // dispatch for IE
    //         var evt = document.createEventObject();
    //         return element.fireEvent('on'+event,evt)
    //     }
    //     else{
    //         // dispatch for firefox + others
    //         var evt = document.createEvent("HTMLEvents");
    //         evt.initEvent(event, true, true ); // event type,bubbling,cancelable
    //         return !element.dispatchEvent(evt);
    //     }
    // };

    // _fireEvent(document.getElementById('input-card'), 'change');

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


    // var _changeColorInput(element, color) {
    //
    //     // element.setAttribute('style', 'color:#ff0000 !important');
    //     //
    //     // element.className += " formInvalid";
    //
    // }

    var _serviceCreditCard = function(charCode) {

        var serviceCreditCard = {};

        serviceCreditCard.creditCardHolderLengthMax = 60;
        serviceCreditCard.creditCardCVVLengthMax = 3;
        serviceCreditCard.cardFormatArray = [];

        serviceCreditCard.getCreditCardHolderInput = function() {
            return document.getElementById(_idInputMapper.cardHolder);
        };


        serviceCreditCard.getCardFormatArray = function() {

        };

        serviceCreditCard.getCreditCardCVVLengthMax = function(forceReload) {
            if (serviceCreditCard.creditCardCVVLengthMax == undefined || forceReload == undefined || forceReload == true) {


                var arrayFormatCVV = ['34', '35', '36', '37'];
                var creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length; indexFormatCVV++) {
                    // console.log(arrayFormatCVV);
                    if (creditCardNumber.value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }
            }
            return serviceCreditCard.creditCardCVVLengthMax;
        };


        serviceCreditCard.getCardTypeId = function() {
            serviceCreditCard.initInfoCardWithCardNumber();
            return serviceCreditCard.idType;
        }



        serviceCreditCard.initInfoCardWithCardNumber = function(creditCardNumber) {

            if (creditCardNumber == undefined) {
                creditCardNumber = document.getElementById(_idInputMapper.cardNumber).value;
            }


            if (document.getElementById(_idInputMapper.cardType)) {
                document.getElementById(_idInputMapper.cardType).src = undefined;
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



            // alert(validatorCreditCardNumber.isCardNumberValid());

            // document.getElementById("creditCardNumberMessageContainer").innerHTML="";
            // document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');
            document.getElementById(_idInputMapper.cardCVV).disabled = false;
            if ( serviceCreditCard.cardNumberStringFormatAfter != '' && validatorCreditCardNumber.isValid( document.getElementById(_idInputMapper.cardNumber).value) ) {

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
                        alert("You can proceed!");
                    }


                    // inputdisable
                    cvvElement.disabled = true;

                }
                element.focus();
            } else {
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



            // alert(validatorCreditCardNumber.isCardNumberValid());

            // document.getElementById("creditCardExpiryDateMessageContainer").innerHTML="";
            // document.getElementById(_idInputMapper.cardExpiryDate).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');
            // console.log('_inputCardExpiryDateFinish');
            // console.log(validatorCreditCardExpiryDate);
            // console.log(validatorCreditCardExpiryDate.isValid( document.getElementById(_idInputMapper.cardExpiryDate).value));
            if ( 7 == document.getElementById(_idInputMapper.cardExpiryDate).value.length && validatorCreditCardExpiryDate.isValid( document.getElementById(_idInputMapper.cardExpiryDate).value) === true ) {


                element.focus();
            } else {
                // console.log('error expiry date');
                // console.log(document.getElementById(_idInputMapper.cardExpiryDate).value.length);
                if (7 == document.getElementById(_idInputMapper.cardExpiryDate).value.length && validatorCreditCardExpiryDate.isValid(document.getElementById(_idInputMapper.cardExpiryDate).value) === false) {

                    // console.log(validatorCreditCardExpiryDate.errorCollection[0]['message']);
                    // document.getElementById("creditCardExpiryDateMessageContainer").innerHTML="Le format de la carte n'est pas valide";
                    // document.getElementById("creditCardExpiryDateMessageContainer").innerHTML=validatorCreditCardExpiryDate.errorCollection[0]['message'];



                    // document.bgColor = _colorInput['error'];
                    // document.getElementById(_idInputMapper.cardNumber).value = 'toto';
                    // document.getElementById(_idInputMapper.cardExpiryDate).setAttribute('style', 'color:'+ _colorInput["error"] + ' !important; border-color:'+ _colorInput["error"] + ' !important;');
                    // document.getElementById(_idInputMapper.cardHolder).style.color = "#ff0000";
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


                // console.log(startNumberArray);
                var startNumber;
                var startNumberToCompare;


                var cardNumberMaxLength = 23;

                var propt;
                for (var indexNumber = 0; indexNumber < startNumberArray.length; indexNumber++) {

                    // console.log(startNumberArray[indexNumber]);
                    startNumber = startNumberArray[indexNumber][0].toString();
                    propt = startNumberArray[indexNumber][1].toString();
                    startNumberToCompare = startNumber.substr(0,Math.min(startNumber.length, creditCardNumber.length));
                    if (creditCardNumber.indexOf(startNumberToCompare) === 0) {


                        cardNumberMaxLength = _cardFormatDefinition[propt]["lengths"]["length"];
                        if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                            cardNumberMaxLength = cardNumberMaxLength + _cardFormatDefinition[propt]["lengths"]["variable"];
                        }

console.log("cardNumberMaxLength");
console.log(cardNumberMaxLength);
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

                console.log("isPotentiallyValid");
                console.log(isPotentiallyValid);

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


                // console.log(creditCardNumberUnformatted);
                // console.log(serviceCreditCard.cardFormatArray);
                // console.log("isTypeValid");
                // console.log(serviceCreditCard.getCardTypeId());
                // console.log(_isTypeValid(serviceCreditCard.cardFormatArray));
                // value = value.split(' ').join('');


                // _init(value);

                // if (_isTypeValid(serviceCreditCard.cardFormatArray) === false) {
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

            // validatorCreditCardNumber.displayErrorMessage = function(errorCollection) {
            //
            //     if (errorCollection == undefined) {
            //         errorCollection = validatorCreditCardNumber.errorCollection;
            //     }
            //     if (errorCollection.length > 0) {
            //         document.getElementById("creditCardNumberMessageContainer").innerHTML=errorCollection[0]['message'];
            //         document.bgColor = _colorInput["error"];
            //         document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["error"] + ' !important');
            //
            //     }
            //
            // };
            //
            // validatorCreditCardNumber.clearDisplayErrorMessage = function() {
            //     document.getElementById("creditCardNumberMessageContainer").innerHTML="";
            //     document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');
            // };


            // var _isTypeValid =function(cardFormatArray) {
            var _isTypeValid =function(cardTypeId) {
                if (_cardFormatDefinition.hasOwnProperty(cardTypeId) === false) {

                    // if (cardFormatArray == undefined || cardFormatArray == "") {
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
                // if (!(nCheck % 10) == 0) {
                // validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(409, 'Luhn invalid'));
                // }
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

            // validatorExpiryDate.isValid = function(month,year) {




            validatorExpiryDate.isPotentiallyValid = function(creditCardExpiryDate) {
                var isPotentiallyValid = false;


                console.log("isPotentiallyValid date start");
                var splitExpiryDate = creditCardExpiryDate.split(' / ');
                console.log("splitExpiryDate.length");
                console.log(splitExpiryDate);
                if (splitExpiryDate.length < 2) {
                    console.log("test4");
                    if (splitExpiryDate <= 12) {
                        isPotentiallyValid = true;
                    }
                } else {
                    console.log("test3");
                    if (splitExpiryDate.length == 2) {
                        var month = splitExpiryDate[0];
                        var year = splitExpiryDate[1];
                        if (year.length < 2) {
                            console.log("test1");
                            if (month <= 12 && year >= 1) {
                                isPotentiallyValid = true;
                            }
                        } else {
                            console.log("test2");
                            // Return today's date and time
                            var currentTime = new Date();

                            // returns the month (from 0 to 11)
                            var currentMonth = currentTime.getMonth() + 1;

                            // returns the year (four digits)
                            var currentYear = currentTime.getFullYear();

                            var yearYYYY = "20" + year;
                            if(yearYYYY > currentYear) {
                                isPotentiallyValid = true;
                            } else if(yearYYYY == currentYear && month >= currentMonth) {
                                isPotentiallyValid = true;
                            }



                        }


                    }
                }

                console.log("isPotentiallyValid expiry date");
                console.log(isPotentiallyValid);

                if (isPotentiallyValid == false) {
                    validatorExpiryDate.isValid(creditCardExpiryDate);
                }
                console.log("isPotentiallyValid expiry date");
                console.log(isPotentiallyValid);
                console.log(validatorExpiryDate.isValid(creditCardExpiryDate));

                return isPotentiallyValid;

            };

            validatorExpiryDate.isValid = function(creditCardExpiryDate) {


                // console.log("creditCardExpiryDate");
                // console.log(creditCardExpiryDate);
                if (creditCardExpiryDate == undefined) {
                    creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;
                }
                var splitExpiryDate = creditCardExpiryDate.split(' / ');
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
                // console.log(year);
                // console.log(currentYear);
                if(month > 12) {
                    // validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'Le mois doit être compris en 1 et 12'));
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_MONTH_EXPIRY_DATE")));
                    return false;
                } else if(year < currentYear) {
                    // validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, "L'année est inférieure à l'année en cours"));
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_EXPIRY_DATE_PAST")));
                    return false;
                }
                else if(year == currentYear && month < currentMonth || year < currentYear) {
                    // validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'expiry card invalid'));
                    // validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'carte expirée'));
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

                console.log("creditCardCVVString");
                console.log(creditCardCVVString);
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




                if (isPotentiallyValid == false) {
                    validatorCreditCardCVV.isValid(creditCardCVVString);
                }
                console.log("isPotentiallyValid expiry date");
                console.log(isPotentiallyValid);
                console.log( validatorCreditCardCVV.isValid(creditCardCVVString));

                return isPotentiallyValid;
            };


            validatorCreditCardCVV.isValid = function (creditCardCVVString) {
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

                // alert(serviceCreditCard.creditCardCVVLengthMax);
                // alert(validateAll);

                // alert(validateAll == undefined);
                // alert("creditCardCVVString.length");
                // alert(creditCardCVVString);
                // alert(creditCardCVVString.length);
                // alert(serviceCreditCard.getCreditCardCVVLengthMax());
                // alert((validateAll == undefined || validateAll == true) && creditCardCVVString.length < serviceCreditCard.creditCardCVVLengthMax );

                if ((validateAll == undefined || validateAll == true) && creditCardCVVString.length < serviceCreditCard.creditCardCVVLengthMax ) {
                    // validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, 'Le champ CVC doit contenir '+serviceCreditCard.creditCardCVVLengthMax+' digits'));
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));

                    return false;
                }




                return true;
            };

            // validatorCreditCardCVV.displayErrorMessage = function(errorCollection) {
            //     if (errorCollection.length > 0) {
            //         document.getElementById("creditCardCVVMessageContainer").innerHTML = errorCollection[0]['message'];
            //         document.getElementById(_idInputMapper.cardCVV).setAttribute('style', 'color:'+ _colorInput["error"] + ' !important');
            //
            //     }
            //     // document.bgColor = _colorInput['error'];
            // };
            //
            // validatorCreditCardCVV.clearDisplayErrorMessage = function() {
            //     document.getElementById("creditCardCVVMessageContainer").innerHTML="";
            //     // document.bgColor = _colorInput['default'];
            //     document.getElementById(_idInputMapper.cardCVV).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');
            // };



            return validatorCreditCardCVV;

        };

        serviceCreditCard.validatorCreditCard = function(errorCollection) {

            var validatorCreditCard = {};
            // validatorCreditCard.errorCollection = errorCollection;
            validatorCreditCard.errorCollection = [];


            validatorCreditCard.isValid = function(params) {
// console.log(params);
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



        // var _init = function(value) {
        // (function(charCode){
        serviceCreditCard.initCreditCardNumber = function(charCode){

            serviceCreditCard.lastCharCode = charCode;

            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharString = '';
            }
            else {
                serviceCreditCard.lastCharString = String.fromCharCode(charCode);
            }

            if (serviceCreditCard.lastCharString === '') {
                // alert(serviceCreditCard.lastCharString);
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

            if (startB >= 0 && endB > 0 && startB < endB) {

                newTempStringAfter = newTempStringAfter.substring(0,startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                endA = startA;
                // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore;
                // alert("cleanCardNumberStringBefore" + cleanCardNumberStringBefore);
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
            }


            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {

                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {


                    if (charCode == 8) {

                    } else {
                        tempStringAfter += serviceCreditCard.lastCharString;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;


                    }


                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;


// formatage du numero

            serviceCreditCard.cardLengthMin = 0;
            serviceCreditCard.cardLengthMax = null;

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

                                var span = document.createElement('img');
                                // span.innerHTML = '*';
                                span.className = 'asterisk';

                                my_elem.parentNode.insertBefore(span, my_elem);






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
                serviceCreditCard.cardNumberStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;
                startA = startB;
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
            }



            var startA = startBFormat;

            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {

                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {


                    if (charCode == 8) {

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




        serviceCreditCard.initCreditCardExpiryDate = function(charCode){

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
            serviceCreditCard.creditCardExpiryDateUnformattedBefore = splitFormatBeforetemp.split(' / ').join('');




            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardExpiryDate));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

            // console.log("startBFormat");
            // console.log(startBFormat);


            // calcul des positions de curseur sans formatage :
            // si espace(s) entre debut et position curseur => on soustrait le nb d'espaces

            var subStringStart =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, startBFormat);

            var splitSubStringStart = subStringStart.split(' / ');
            var nbSpaceStart = (splitSubStringStart.length - 1)*3;
            // console.log("splitSubStringStart.length");
            // console.log(splitSubStringStart.length);
            // console.log(nbSpaceStart);

            var subStringEnd =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, endBFormat);


            var splitSubStringEnd = subStringEnd.split(' / ');
            var nbSpaceEnd = (splitSubStringEnd.length - 1)*3;

            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);

            // var startB = parseInt(startBFormat);
            // var endB = parseInt(endBFormat);


            var startA = startB;
            var endA = endB;
            // console.log("startB");
            // console.log(startB);
// console.log(endB);

            // string after

            var newTempStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;


// console.log("newTempStringAfter");
// console.log(newTempStringAfter);













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
            }



            // var startA = startBFormat;

            var tempStringAfter = "";




            var startAtemp = startA;

            // console.log("startA before");
            // console.log(startA);
            // console.log("newTempStringAfter");
            // console.log(newTempStringAfter);
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {

                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {

                    // console.log("nbbefore == startA");


                    if (charCode == 8) {

                    } else {
                        tempStringAfter += serviceCreditCard.lastCharStringCreditCardExpiryDate;
                        // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                        startAtemp = startAtemp + 1;


                    }


                }




                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;


// console.log("tempStringAfter");
// console.log(tempStringAfter);
            if (tempStringAfter.length <= 4) {
                serviceCreditCard.cardExpiryDateStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardExpiryDateStringAfter = serviceCreditCard.creditCardExpiryDateFormattedBefore;
                startA = startBFormat;
            }

// console.log("serviceCreditCard.cardExpiryDateStringAfter");
// console.log(serviceCreditCard.cardExpiryDateStringAfter);
            serviceCreditCard.cardExpiryDateStringFormattedAfter =  serviceCreditCard.cardExpiryDateStringAfter;
            if ( serviceCreditCard.cardExpiryDateStringFormattedAfter.length === 1) {
                if (serviceCreditCard.cardExpiryDateStringFormattedAfter.charAt(0) > 1) {
                    serviceCreditCard.cardExpiryDateStringFormattedAfter = "0"+serviceCreditCard.cardExpiryDateStringFormattedAfter;
                    startA = startA + 1;
                }
            }

            if ( serviceCreditCard.cardExpiryDateStringFormattedAfter.length >= 2) {

                if (serviceCreditCard.cardExpiryDateStringFormattedAfter.split(' / ').length < 2) {
                    serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(0, 2) + " / " + serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(2, serviceCreditCard.cardExpiryDateStringFormattedAfter.length);
                    startA = startA + 3;
                }
            }






            document.getElementById(_idInputMapper.cardExpiryDate).value = serviceCreditCard.cardExpiryDateStringFormattedAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardExpiryDate), startA);
            _inputCardExpiryDateFinish( document.getElementById(_idInputMapper.cardCVV), serviceCreditCard);





            // })(charCode);
        };



        serviceCreditCard.initCreditCardCVV = function(charCode){

            serviceCreditCard.lastCharCodeCreditCardCVV = charCode;
            if (charCode == undefined || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardCVV = '';
            }
            else {
                serviceCreditCard.lastCharStringCreditCardCVV = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardCVVStringFormatedBefore = document.getElementById(_idInputMapper.cardCVV).value;

            var getStartEndCursor = _getSelection(document.getElementById(_idInputMapper.cardCVV));
            // console.log(getStartEndCursor);
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
            // console.log("startBFormat");
            // console.log(startBFormat);
            // console.log("startA");
            // console.log(startA);
            // console.log(newTempStringAfter);
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
            }



            var startA = startBFormat;

            var tempStringAfter = "";


            var startAtemp = startA;
            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++ ) {

                // if (nbBefore == realCursorPositionInNumberBefore) {
                if (nbBefore == startA) {


                    if (charCode == 8) {

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
                // console.log(arrayFormatCVV);
                if (creditCardNumber.value != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                    serviceCreditCard.creditCardCVVLengthMax = 4;
                }
            }



            if (serviceCreditCard.creditCardCVVLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardCVVLengthMax) {
                serviceCreditCard.cardCVVStringAfter = tempStringAfter;
            }
            else {
                serviceCreditCard.cardCVVStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;
                startA = startBFormat;
            }
            // console.log("serviceCreditCard.cardCVVStringAfter");
            // console.log(serviceCreditCard.cardCVVStringAfter);

            document.getElementById(_idInputMapper.cardCVV).value = serviceCreditCard.cardCVVStringAfter;
            _setCaretPosition(document.getElementById(_idInputMapper.cardCVV), startA);





            // })(charCode);
        };















        return serviceCreditCard;
        // this.validator = new _validatorCC(errorCollection);
    }





    var _callbackEventFormChange;
    var _callbackEventFormChangeTest;

    var _initErrorHandler = function(){
        console.log('init error');

        for (var indexInput in _idInputMapper) {
            if (indexInput != "cardType") {
                document.getElementById(_idInputMapper[indexInput]).setAttribute('style', 'color:' + _colorInput["default"] + ' !important');
            }
        }

        // document.getElementById(_idInputMapper.cardNumber).setAttribute('style', 'color:'+ _colorInput["default"] + ' !important');


        var errors = HiPay.Form.paymentFormDataGetErrors();

        for (var indexError in errors) {
            console.log(indexError);
            document.getElementById(_idInputMapper[indexError]).setAttribute('style', 'color:#ff0000 !important');
        }
        console.log("class errors");
        console.log(errors);
    };


    var _addListenerMulti = function (idElement, s, fn) {


        var eventList = s.split(' ');

        for(var eventIndex = 0; eventIndex < eventList.length; eventIndex++) {

            document.getElementById(idElement).addEventListener(eventList[eventIndex], function (e) {fn();console.log("ok" + eventIndex);},false);


        }
    };




    var _initListenEvent = function(idElement){

        _addListenerMulti(idElement, 'keypress blur focus', _initErrorHandler);
    };


    // _callbackEventFormChange();



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


        for(var propt in _idInputMapper){


            // console.log(propt);
            if (propt == 'cardNumber') {

                document.getElementById(_idInputMapper['cardNumber']).addEventListener('keydown', function (e) {
                    // console.log("first");
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
                    // alert('toto');
                    // HiPay.Form.paymentFormDataGetErrors();

                });


                document.getElementById(_idInputMapper['cardNumber']).addEventListener('keypress', function (e) {
                    // return false;
                    evt = e || window.event;

                    // console.log(document.getElementById(_idInputMapper['cardNumber']));
                    var charCode = evt.keyCode || evt.which;

                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardNumber(charCode);
                    }

                    _callbackEventFormChange();

                    // _callbackEventFormChange();
                });

                document.getElementById(_idInputMapper[propt]).addEventListener('keyup', function (e) {

                    // console.log(document.getElementById(_idInputMapper['cardNumber']));
                    // console.log(_idInputMapper['cardNumber']);

                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardCVV();
                    _instanceServiceCreditCard.initCreditCardNumber();

                });

                // document.getElementById(_idInputMapper['cardNumber']).addEventListener('blur', function (e) {
                //     console.log('test');
                //     _initErrorHandler();
                // });
                // document.getElementById('input-card').addEventListener('blur', function (e) {_initErrorHandler(e);},false);
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
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);

                        // _instanceServiceCreditCard.initCreditCardNumber(charCode);
                        // evt.preventDefault();
                        // _callbackEventFormChange();
                    } else {


                        // // alert(_instanceServiceCreditCard.getCreditCardHolderInput().value.length);
                        // if (_instanceServiceCreditCard.getCreditCardHolderInput().value.length > _instanceServiceCreditCard.creditCardHolderLengthMax - 1) {
                        //
                        //     evt.preventDefault();
                        //
                        // } else {
                        //     // evt.preventDefault();
                        //
                        // }
                        // // alert( _instanceServiceCreditCard.creditCardHolderLengthMax);
                        // // evt.preventDefault();
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
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);

                        // _instanceServiceCreditCard.initCreditCardNumber(charCode);
                        // evt.preventDefault();
                        // _callbackEventFormChange();
                    } else {


                        // // alert(_instanceServiceCreditCard.getCreditCardHolderInput().value.length);
                        // if (_instanceServiceCreditCard.getCreditCardHolderInput().value.length > _instanceServiceCreditCard.creditCardHolderLengthMax - 1) {
                        //
                        //     evt.preventDefault();
                        //
                        // } else {
                        //     // evt.preventDefault();
                        //
                        // }
                        // // alert( _instanceServiceCreditCard.creditCardHolderLengthMax);
                        // // evt.preventDefault();
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

            }

            else if (propt == 'cardCVV') {

                document.getElementById(_idInputMapper['cardCVV']).addEventListener('keydown', function (e) {
                    // console.log("first");
                    evt = e || window.event;

                    var charCode = evt.keyCode || evt.which;
                    if (charCode == 8 || charCode == 46) {
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardCVV(charCode);
                        evt.preventDefault();
                        // _callbackEventFormChange();
                    } else {
                        // evt.preventDefault();
                    }




                    var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
                    // validatorCreditCardCVV.clearDisplayErrorMessage();
                    // alert(document.getElementById(_idInputMapper['cardCVV'].value);
                    // if (!validatorCreditCardCVV.isValid(document.getElementById(_idInputMapper['cardCVV']).value)) {
                    //     validatorCreditCardCVV.displayErrorMessage(validatorCreditCardCVV.errorCollection);
                    // }

                    _callbackEventFormChange();


                });


                document.getElementById(_idInputMapper['cardCVV']).addEventListener('keypress', function (e) {
                    // return false;
                    evt = e || window.event;


                    var charCode = evt.keyCode || evt.which;

                    evt.preventDefault();
                    if (charCode >= 48 && charCode <= 57) {
                        /* is valid add char */
                        // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardCVV(charCode);
                    }

                    _callbackEventFormChange();






                    // _callbackEventFormChange();
                });


                document.getElementById(_idInputMapper['cardCVV']).addEventListener('blur', function (e) {
                    // console.log(HiPay.Form.CVCHelpText());
                    // console.log(document.getElementById(_idInputMapper['cardCVV']));
                    // console.log(_idInputMapper['cardCVV']);

                    _instanceServiceCreditCard = new _serviceCreditCard();

                    var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
                    // validatorCreditCardCVV.clearDisplayErrorMessage();
                    // alert(document.getElementById(_idInputMapper['cardCVV'].value);
                    // if (!validatorCreditCardCVV.isValid(document.getElementById(_idInputMapper['cardCVV']).value)) {
                    //     validatorCreditCardCVV.displayErrorMessage(validatorCreditCardCVV.errorCollection);
                    // }
                    // _instanceServiceCreditCard.initCreditCardCVV();
                    // _instanceServiceCreditCard.initCreditCardNumber();

                });





                // document.getElementById(_idInputMapper[propt]).addEventListener('keydown', function (e) {
                //
                //
                //     evt = e || window.event;
                //
                //     var charCode = evt.keyCode || evt.which;
                //     if (charCode == 8 || charCode == 46) {
                //         _instanceServiceCreditCard = new _serviceCreditCard();
                //         _instanceServiceCreditCard.initCreditCardCVV(charCode);
                //         evt.preventDefault();
                //         // _instanceServiceCreditCard = new _serviceCreditCard(charCode);
                //
                //         // _instanceServiceCreditCard.initCreditCardNumber(charCode);
                //         // evt.preventDefault();
                //         // _callbackEventFormChange();
                //     } else {
                //
                //
                //         // // alert(_instanceServiceCreditCard.getCreditCardHolderInput().value.length);
                //         // if (_instanceServiceCreditCard.getCreditCardHolderInput().value.length > _instanceServiceCreditCard.creditCardHolderLengthMax - 1) {
                //         //
                //         //     evt.preventDefault();
                //         //
                //         // } else {
                //         //     // evt.preventDefault();
                //         //
                //         // }
                //         // // alert( _instanceServiceCreditCard.creditCardHolderLengthMax);
                //         // // evt.preventDefault();
                //     }
                //     _callbackEventFormChange();
                //
                //
                //
                // });
                //
                // document.getElementById(_idInputMapper[propt]).addEventListener('keypress', function (e) {
                //
                //     evt = e || window.event;
                //
                //     var charCode = evt.keyCode || evt.which;
                //
                //     evt.preventDefault();
                //     if (charCode >= 48 && charCode <= 57) {
                //
                //
                //     // if (charCode == 8 || charCode == 46) {
                //     //
                //     // } else {
                //
                //         _instanceServiceCreditCard = new _serviceCreditCard();
                //         _instanceServiceCreditCard.initCreditCardCVV(charCode);
                //         // evt.preventDefault();
                //     }
                //     _callbackEventFormChange();
                // });

            }



            else {


                // document.getElementById(_idInputMapper[propt]).addEventListener('keypress', function (e) {
                //     if (charCode == 8 || charCode == 46) {
                //
                //     } else {
                //
                //         // _instanceServiceCreditCard = new _serviceCreditCard();
                //         // _instanceServiceCreditCard.initCreditCardHolder(charCode);
                //         // evt.preventDefault();
                //     }
                // });
            }

            _initListenEvent(_idInputMapper[propt]);

        }


    };


    var _getParamsFromForm = function() {
        var creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;


        var explodeExpiryDate = creditCardExpiryDate.split(' / ');

        // console.log(explodeExpiryDate.length);

        var month = "";
        var year = "";
        if (explodeExpiryDate.length == 2) {
            month = explodeExpiryDate[0];

            // if(explodeExpiryDate[1] != "" && explodeExpiryDate[1].length == 2) {
            //     year = "20" + explodeExpiryDate[1];
            // } else {
            year = explodeExpiryDate[1];
            // }
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

    HiPay.Form.paymentFormDataGetErrors = function() {

        _instanceServiceCreditCard = new _serviceCreditCard();
        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        var params = _getParamsFromForm();

        console.log(params);
        var errorCollection = {};
        var hasError = false;


        // Credit card number
        var validatorCreditCardNumber = _instanceServiceCreditCard.validatorCreditCardNumber();
        var creditCardNumberUnformatted = _instanceServiceCreditCard.unformatCreditCardNumber(params['card_number']);

        if (creditCardNumberUnformatted != "") {

            if (!validatorCreditCardNumber.isPotentiallyValid(creditCardNumberUnformatted) ||
                (!validatorCreditCardNumber.isValid(creditCardNumberUnformatted) && document.getElementById(_idInputMapper.cardNumber) !== document.activeElement )
            ) {

                console.log("error card number");
                console.log(validatorCreditCardNumber.isPotentiallyValid(creditCardNumberUnformatted));
                console.log("error card number is valid");
                console.log(validatorCreditCardNumber.isValid(creditCardNumberUnformatted));
                // validatorCreditCard.errorCollection['creditCardNumber'] = validatorCreditCardNumber.errorCollection;
                errorCollection['cardNumber'] = validatorCreditCardNumber.errorCollection[0]['message'];
                // console.log("display errors");
                // console.log(errorCollection);
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
            creditCardExpiryDateString +=  " / " + params['card_expiry_year'];
        }

        if (creditCardExpiryDateString != "") {
            // console.log("creditCardExpiryDateString");
            // console.log(creditCardExpiryDateString);


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


    HiPay.Form.change = function(callback) {
        // $("input").on('change keydown paste input', function() {
        //     console.log("second");
        //     _instanceServiceCreditCard = new _serviceCreditCard();
        _callbackEventFormChange = callback;
        // _callbackEventFormChangeTest = "test";
        // _toto = "toto";
        // console.log(callback);
        // _callbackEventFormChange = function() {
        //   alert('toto');
        // };
        // _callbackEventFormChange();
        // });
    };



    // HiPay.Form.paymentFormDataGetErrors = function() {
    //     _instanceServiceCreditCard = new _serviceCreditCard();
    //     alert("error");
    //     // if (_instanceServiceCreditCard.isValid()) {
    //     //
    //     // }
    //
    // };

    HiPay.Form.paymentFormDataIsValid = function() {

        // console.log(_instanceServiceCreditCard);
        var params = {
            card_number: $('#input-card')[0].value,
            card_holder: $('#input-name')[0].value,
            cvc: $('#input-cvv')[0].value,
            // card_expiry_month: $('#input-month')[0].value,
            // card_expiry_year: $('#input-year')[0].value,
            card_expiry_date: $('#input-expiry-date')[0].value,

            multi_use: '0'
        };


        if (!_instanceServiceCreditCard) {

            _instanceServiceCreditCard = new _serviceCreditCard();
        }
//         $("input").on('change keydown paste input', function(){
        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();
        // console.log('isValidParams');
        // console.log(validatorCreditCard.isValid(params));
        return validatorCreditCard.isValid(params);
        // });


        // return _isValidCCForm(params).length === 0;
    }


    /**
     *
     * @param params
     * @returns {Array}
     * @private
     */
        // var _isValidCCForm = function (params) {
        //     var errorCollection = [];
        //
        //
        //     var errors = {'code':0, 'message':''};
        //     var unallowedParams = [];
        //     for (key in params) {
        //         if (HiPay.allowedParameters[key] != true) {
        //             unallowedParams.push(key);
        //         }
        //     }
        //
        //     if (unallowedParams.length > 0) {
        //
        //         errors.code = 408;
        //         var message = 'unallowed parameters: {'
        //         for (key in unallowedParams) {
        //
        //             message += unallowedParams[key] + ' ';
        //         }
        //         message += '}';
        //         message += ' allowed parameters are: {';
        //
        //         for (key in HiPay.allowedParameters) {
        //             message += key;
        //             message += ' ';
        //         }
        //         message += '}';
        //
        //         errors.message = message;
        //     }
        //
        //     // @todo changer le nom HiPay.ValidationError
        //     // var validatorCreditCardNumber = new _validatorCreditCardNumber(errorCollection);
        //
        //     var validatorCreditCardNumber = _instanceServiceCreditCard.validatorCreditCardNumber(errorCollection);
        //     if ( ! validatorCreditCardNumber.isCardNumberValid(params['card_number']) ) {
        //
        //         errorCollection = validatorCreditCardNumber.errorCollection;
        //         // errors.code = 409;
        //         // errors.message = 'cardNumber is invalid : luhn check failed';
        //     }
        //
        //     var validatorExpiryDate = _instanceServiceCreditCard.validatorExpiryDate(errorCollection);
        //     if ( ! validatorExpiryDate.isValid(params['card_expiry_month'], params['card_expiry_year']) ) {
        //
        //         errorCollection = validatorExpiryDate.errorCollection;
        //         // errors.code = 409;
        //         // errors.message = 'cardNumber is invalid : luhn check failed';
        //     }
        //
        //     return errorCollection;
        // };

    var _processObjectPayload = function (instance, payload, specialValueCallback) {
            var propertyConfig = [];

            for (var key in payload || {}) {


                // $.each(payload || {}, function (key, val) {
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

                            // propertyConfig[mapping.name] = $.extend({}, mapping.propertyDescriptors, {
                            // propertyConfig[mapping.name] =Object.assign({}, mapping.propertyDescriptors, {
                            propertyConfig[mapping.name] =_extend({}, mapping.propertyDescriptors, {
                                value: value,
                                configurable: true // Values might be refreshed later
                            });

                        }
                    }
                }


                // });
            }

            if (_canDefineProperty) {
                Object.defineProperties(instance, propertyConfig);
            }
        };

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

    HiPay.Token = function() {
        _bootstrapInstanceProperties(this);
    }

    HiPay.Token.populateProperties = function (context, payload) {



        _processObjectPayload(context, payload,  function (key, val){
            // switch (key) {
            // case 'token':
            //     break;
            // }
        });


        return context;
    };

    HiPay.setTarget = function(target) {
        HiPay.target = target;
    };

    HiPay.getTarget = function() {
        return HiPay.target;
    };

    HiPay.setCredentials = function(username, publicKey) {
        HiPay.username = username;
        HiPay.publicKey = publicKey;
    };

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



        if ('XDomainRequest' in window && window.XDomainRequest !== null) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey);
        }

        var config = {
            headers: {
                'Authorization': 'Basic ' + authEncoded,
                'contentType': 'application/json'
            }
        };

        // axios.post("http://localhost:8080/example/index5.php",{key: 'value'})
        //     .then(function (response) {

        //     })
        //     .catch(function (error) {

        //     });


        function isIE () {
            var myNav = navigator.userAgent.toLowerCase();
            return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
        }


        // if (isIE () == 8) {
        //     // IE8 code
        // } else {
        //     // Other versions IE or not IE
        // }
        //

        // if (isIE () && isIE () < 9) {
        //     var xdr;
        //     function err() {
        //         alert('Error');
        //     }
        //     function timeo() {
        //         alert('Time off');
        //     }
        //     function loadd() {
        //         alert('Response: ' +xdr.responseText);
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
        //         alert('XDR undefined');
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
// alert('toto');
//                     // Most browsers.
//                     xhr.open(method, url, true);
//                 } else if (typeof XDomainRequest != "undefined") {
//                     // IE8 & IE9
//                     alert('titi');
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
//                         alert(appliance.status);
//                         if (appliance.status === 200) {
//                             alert("ok");
//                             // success, use appliance.responseText
//                         } else {
//                             // error
//                             alert("error");
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
        // alert('toto');
        return new Promise(function (resolve, reject) {
            axios.post(endpoint,requestParams,config)
                .then(function(responseJson) {

                    if( typeof responseJson['code'] != 'undefined' )  {
                        reject(new _APIError(responseJson));
                    }
                    else {
                        var cardToken = new HiPay.Token(responseJson);
                        cardToken.constructor.populateProperties(cardToken, responseJson.data);
                        resolve(cardToken);
                    }
                }).catch(function (error) {
                reject(new _APIError(error));

                /* IE */







                // var appliance = new window.XDomainRequest();
                // appliance.onload = function() {
                //     // do something with appliance.responseText
                // };
                // appliance.onerror = function() {
                //     // error handling
                // };
                //
                // // (endpoint,requestParams,config
                // appliance.open("POST", endpoint, true);
                // appliance.send(requestParams);


                // returnPromise.reject(new _APIError(error));
            });
        });



        // }
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
    var _InvalidParametersError = function (code, message) {
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

        /**
         * The type of error.
         *
         * @property token
         * @type string
         * @final
         */
        token: {name: 'token'},

        /**
         * Additional details such as a list of invalid parameters. Refer to the API reference for more information.
         *
         * @property request_id
         * @type Object
         * @final
         */

        requestId: {name: 'request_id'},

        /**
         * The cc brand.
         *
         * @property serverResponse
         * @type string
         * @final
         */

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

        /**
         * The type of error.
         *
         * @property code
         * @type number
         * @final
         */
        code: {name: 'code'},

        /**
         * Additional details such as a list of invalid parameters. Refer to the API reference for more information.
         *
         * @property message
         * @type Object
         * @final
         */

        message: {name: 'message'},

    });


    _defineProperties(_InvalidParametersError, {

        /**
         * The type of error.
         *
         * @property code
         * @type number
         * @final
         */

        code: {name: 'code'},

        /**
         * Additional details such as a list of invalid parameters. Refer to the API reference for more information.
         *
         * @property details
         * @type Object
         * @final
         */

        message: {name: 'message'},

        /**
         * The server response body.
         *
         * @property serverResponse
         * @type string
         * @final
         */

        server_response: {name: 'serverResponse'}
    });


    _defineProperties(_InvalidFormTokenizationError, {

        /**
         * The type of error.
         *
         * @property code
         * @type number
         * @final
         */

        code: {name: 'code'},

        /**
         * Additional details such as a list of invalid parameters. Refer to the API reference for more information.
         *
         * @property details
         * @type Object
         * @final
         */

        message: {name: 'message'},

        /**
         *
         */
        errorCollection: {name: 'errorCollection'},

        /**
         * The server response body.
         *
         * @property serverResponse
         * @type string
         * @final
         */

        server_response: {name: 'serverResponse'}
    });

    // HiPay.tokenize = function(params) {
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
            var endpoint = 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
            if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
                endpoint = 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json';
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


    HiPay.Form.setLocale = function(localeString) {
        HiPay.Form.locale = localeString;

    };




    HiPay.Form.CVCHelpText = function() {

        //usage:
//         _readTextFile("http://localhost/src/lang/"+localeString+".json", function(text){
//             _translationJSON = JSON.parse(text);
//         });
// console.log(_translationJSON);

        var serviceCreditCard = new _serviceCreditCard();
        var CVVLength = serviceCreditCard.getCreditCardCVVLengthMax();
        if (CVVLength == undefined) {
            CVVLength = 3;
        }
        // document.getElementById(_cvvContainerId).innerHTML = _translationJSON[HiPay.Form.locale]["FORM_CVV_"+CVVLength+"_HELP_MESSAGE"];
        return _translationJSON[HiPay.Form.locale]["FORM_CVV_"+CVVLength+"_HELP_MESSAGE"];
        // return _messagesHelpCVC[CVVLength][HiPay.Form.locale];
    };

    HiPay.Form.tokenizePaymentFormData = function() {

        if (!HiPay.Form.paymentFormDataIsValid()) {
            return false;
        }

        var creditCardExpiryDate = document.getElementById(_idInputMapper.cardExpiryDate).value;
        var explodeExpiryDate = creditCardExpiryDate.split(' / ');
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