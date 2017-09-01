/**
 * HiPay Fullservice library
 */

var HiPay = (function (HiPay) {
    var HiPay = {};

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

        // console.log("mapping");
        // console.log(mapping);
        if (_canDefineProperty) {
            Object.defineProperties(object.prototype, {
                "_mapping": {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: mapping
                }
            });
            // console.log("object._mapping");
            // console.log(object._mapping);
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


    /**
     *
     * @param errorCollection
     * @returns {{}}
     * @constructor
     */
    var ValidatorExpiryDate = function (errorCollection) {

        var validatorExpiryDate = {};
        validatorExpiryDate.errorCollection = errorCollection;

        validatorExpiryDate.isValid = function(month,year) {

            // Return today's date and time
            var currentTime = new Date()

// returns the month (from 0 to 11)
            var currentMonth = currentTime.getMonth() + 1

// returns the year (four digits)
            var currentYear = currentTime.getFullYear()

            if(year == currentYear && month < currentMonth || year < currentYear) {
                validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'expiry card invalid'));
            }
        }

        return validatorExpiryDate;


    };

    // HiPay.ValidationError
    var _validatorCC = function (errorCollection) {
        var validatorCC = {};

        var _cardLengthMin = '';
        var _cardLengthMax = '';








        validatorCC.errorCollection = errorCollection || [];


        validatorCC.isValid = function(value) {

            return _isCardNumberValid(value);
        }


        var _init = function(value) {

            var cardNumberString = value.split(' ').join('');

            var cardLengthMin = 0;
            var cardLengthMax = null;
            var cardFormatArray = [];


            for (var propt in _cardFormatDefinition) {

                /* range */

                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (cardNumberString.indexOf(startNumber) === 0) {
                                // console.log(cardNumberString.indexOf(startNumber));
                                // document.getElementById(_idInputMapper.cardType).innerHTML = propt;


                                document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';
                                cardFormatArray = _cardFormatDefinition[propt]["format"];
                                /* length */
                                cardLengthMin = cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    cardLengthMax = cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                /* ./ length */

                                break;
                            } else {
                                // console.log(cardNumberString.indexOf(startNumber));
                            }
                        }
                    } else {
                        // if (cardNumberString == "41") {
                        //     console.log('variable null');
                        //     console.log(_cardFormatDefinition[propt]["ranges"][i]["first"]);
                        //     console.log(cardNumberString.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]));
                        // }
                        if (cardNumberString.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            // document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                            document.getElementById(_idInputMapper.cardType).innerHTML = '<img width="28px" src="./assets/type/' + _cardImg[propt] + '">';



                            cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            cardLengthMin = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                cardLengthMax = cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }

                            /* ./ length */
                            break;
                        }
                    }
                }
                /* ./ range */
            }

            _cardLengthMin = cardLengthMin;
            _cardLengthMax = cardLengthMax;


        }


        var _isLengthValid = function (value) {

            // console.log(value);
            // console.log('minLength');
            // console.log(value.length < _cardLengthMin || value.length > _cardLengthMax);


            if (value.length < _cardLengthMin || (_cardLengthMax != null && value.length > _cardLengthMax) ) {
                return false;
            }
            return true;


        }


        var _isCardNumberValid = function (value) {

            value = value.split(' ').join('');


            _init(value);




            if (/[^0-9-\s]+/.test(value)) return false;

            console.log("_isLengthValid(value)");
            console.log(_isLengthValid(value));

            if (_isLengthValid(value) === false) {
                console.log("false length");
                return false;
            }

            return _isLuhnValid(value);
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
            if (!(nCheck % 10) == 0) {
                validatorCC.errorCollection.push(new _InvalidParametersError(409, 'Luhn invalid'));
            }
            return (nCheck % 10) == 0;

        };


        /* @todo valid card type */
        // var _isValidType = {
        //     CARDS: {
        //         Visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
        //         MasterCard: /^5[1-5][0-9]{14}$/,
        //         DinersClub: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        //         Amex: /^3[47][0-9]{13}$/,
        //         Discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/
        //     },
        //     TEST_NUMBERS: $w('378282246310005 371449635398431 378734493671000 '+
        //         '30569309025904 38520000023237 6011111111111117 '+
        //         '6011000990139424 5555555555554444 5105105105105100 '+
        //         '4111111111111111 4012888888881881 4222222222222'
        //     ),
        //     validate: function(number){
        //         return CreditCard.verifyLuhn10(number)
        //             && !!CreditCard.type(number)
        //             && !CreditCard.isTestNumber(number);
        //     },
        //     verifyLuhn10: function(number){
        //         return ($A(CreditCard.strip(number)).reverse().inject(0,function(a,n,index){
        //             return a + $A((parseInt(n) * [1,2][index%2]).toString())
        //                     .inject(0, function(b,o){ return b + parseInt(o) }) }) % 10 == 0);
        //     },
        //     isTestNumber: function(number){
        //         return CreditCard.TEST_NUMBERS.include(CreditCard.strip(number));
        //     },
        //     strip: function(number) {
        //         return number.gsub(/\s/,'');
        //     },
        //     type: function(number) {
        //         for(var card in CreditCard.CARDS)
        //             if(CreditCard['is'+card](number)) return card;
        //     }
        // };



        return validatorCC;
    };


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

    var _idInputMapper = {
        cardNumber: 'input-card',
        cardType: 'card-type',
        cardHolder: 'input-name',
        expiryMonth: 'input-month',
        expiryYear: 'input-year',
        cvv: 'input-cvv'
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
     * Format card number
     * @private
     */

    var _formatCC = function() {
// console.log("format cc");
// dump(_cardFormatDefinition);
//         var range= {};
        var cardNumberString = document.getElementById(_idInputMapper.cardNumber).value;
        console.log(cardNumberString.length);
        document.getElementById(_idInputMapper.cardType).innerHTML = '';

        var cardFormatArray = [];

        var cardLengthMin = 0;
        var cardLengthMax = null;

        for(var propt in _cardFormatDefinition){

            /* range */

            for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                    for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                        var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                        if (cardNumberString.indexOf(startNumber) === 0) {
                            // console.log(cardNumberString.indexOf(startNumber));
                            document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                            cardFormatArray = _cardFormatDefinition[propt]["format"];
                            /* length */
                            cardLengthMin = cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] !=null) {
                                cardLengthMax = cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }
                            /* ./ length */

                            break;
                        } else {
                            // console.log(cardNumberString.indexOf(startNumber));
                        }
                    }
                } else {
                    // if (cardNumberString == "41") {
                    //     console.log('variable null');
                    //     console.log(_cardFormatDefinition[propt]["ranges"][i]["first"]);
                    //     console.log(cardNumberString.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]));
                    // }
                    if (cardNumberString.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                        document.getElementById(_idInputMapper.cardType).innerHTML = propt;
                        cardFormatArray = _cardFormatDefinition[propt]["format"];
                        /* length */
                        cardLengthMin = cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];
                        if (_cardFormatDefinition[propt]["lengths"]["variable"] !=null) {
                            cardLengthMax = cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                        }

                        /* ./ length */
                        break;
                    }
                }
            }
            /* ./ range */



            /* format */
            // cardNumberString.replace(/(.{4}) (.{4}) (.{4})/g, '$1 $2 $3 ').trim();






            /* ./ format */
        }


        // console.log(cardFormatArray);
        // console.log(_formatDisplayNumber(cardNumberString,cardFormatArray));
        // console.log(_formatDisplayNumber(cardNumberString,cardFormatArray).length);

        var start = document.getElementById(_idInputMapper.cardNumber).selectionStart,
            end = document.getElementById(_idInputMapper.cardNumber).selectionEnd;

        var beforeFormatLength = document.getElementById(_idInputMapper.cardNumber).value.length;

        console.log(document.getElementById(_idInputMapper.cardNumber).value.length);
        document.getElementById(_idInputMapper.cardNumber).value = _formatDisplayNumber(cardNumberString,cardFormatArray,cardLengthMin,cardLengthMax);


        /* change input if number between min and max and luhn is ok */
        _inputCCFinish( document.getElementById(_idInputMapper.cardHolder),cardNumberString, cardLengthMin, cardLengthMax);


        var afterFormatLength = document.getElementById(_idInputMapper.cardNumber).value.length;



        start = start + (afterFormatLength - beforeFormatLength);
        end = end + (afterFormatLength - beforeFormatLength);

        document.getElementById(_idInputMapper.cardNumber).setSelectionRange(start, end);

    }

    var _inputCCFinish = function(element, cardNumberString, cardLengthMin, cardLengthMax) {


        var validatorCC = new _validatorCC([]);


        if ( cardNumberString != '' && validatorCC.isValid(cardNumberString) ) {

            console.log(element);
            console.log('isValid');
            element.focus();
            //
            // console.log(cardNumberString);
            // console.log(cardLengthMin);
            // console.log(cardLengthMax);
        }


    }



    var _formatDisplayNumber = function(cardNumberString, format, cardLengthMin, cardLengthMax) {

        // if (!cardNumberString) {
        //     return false;
        // }
        // cardNumberString = cardNumberString.replace(" ","");
        cardNumberString = cardNumberString.split(' ').join('');
        console.log(cardNumberString);
        console.log(cardNumberString.length);
        var regex = "";
        var newFormat = "";
        var numberFormatTotal = 0;

        // console.log('cardNumberString');
        // console.log(cardNumberString);
        var newCardNumber = '';
        // console.log('format');
        // console.log(format);
        var start = 0;

        // var position = target.selectionStart; // Capture initial position
        // position = target.selectionStart; // Capture initial position

        console.log(format);
        if (format.length > 0) {
            for (var i = 0; i < format.length; i++) {


                // regex = regex + '(.{' + format[i]+ '})?';
                // regex = regex + '(.{' + format[i]+ '})';
                // newFormat = newFormat + '$'+(i+1)+ ' ';
                numberFormatTotal = numberFormatTotal + format[i];

                var end = Math.min(numberFormatTotal, cardNumberString.length);

                for (j = start; j < end; j++) {

                    // if (cardNumberString.length<numberFormatTotal) {
                    newCardNumber += cardNumberString.charAt(j);
                    // }
                }

                if (cardNumberString.length >= numberFormatTotal) {
                    newCardNumber += ' ';
                    //     start = format[i];
                }
                start = numberFormatTotal;

                if (cardNumberString.length < numberFormatTotal) {
                    break;
                }
                // console.log(cardNumberString.length);
                // console.log(numberFormatTotal);

                // if (cardNumberString.length == format[i]) {
                //     newCardNumber += ' ';
                //     start = format[i];
                // }

                // _cardFormatDefinition[propt]["format"][i]
            }

            for (j = start; j < cardNumberString.length; j++) {

                if (j < cardLengthMax) {
                    newCardNumber += cardNumberString.charAt(j);
                }
            }
        } else {
            newCardNumber = cardNumberString;
        }
        // console.log(regex);
        // console.log(newFormat);
        // return cardNumberString.replace(/^(.{1})(.{2})/g, '$1 $2 ');
        // return cardNumberString.replace(/^regex/g, newFormat);
        // var expression = new RegExp(regex, 'g');

// console.log(regex);
//         var v = cardNumberString.replace(/[^\dA-Z]/g, ''),
//             // reg = new RegExp(".{" + after + "}", "g");
//             reg = new RegExp(regex, "g");
//         return v.replace(reg, function(a) {
//             return a + ' ';
//         });

        // return cardNumberString.replace(/^(.{4})(.{4})+/g, '$1 $2 $3 ');
        // return cardNumberString.replace(expression, newFormat);
        // return cardNumberString.replace(expression, newFormat);
        return newCardNumber;
    }

    HiPay.Form = {};

    var _callbackEventFormChange;

    // _callbackEventFormChange();

    HiPay.Form.change = function(callback) {
        _callbackEventFormChange = callback;
    };




    /* add listener on all input form */
    window.onload = function() {
        for(var propt in _idInputMapper){
            // if (propt == 'cardNumber') {
            //     alert(_idInputMapper[propt]);
            //     _formatCC();
            // }

            if (propt == 'cardNumber') {
                document.getElementById(_idInputMapper[propt]).addEventListener('keyup', function () {

                    _formatCC();
                    _callbackEventFormChange();
                });
            } else {
                document.getElementById(_idInputMapper[propt]).addEventListener('keyup', function () {
                    _callbackEventFormChange();
                });
            }

        }
    };

    HiPay.Form.paymentFormDataIsValid = function() {
        var params = {
            card_number: $('#input-card')[0].value,
            cvc: $('#input-cvv')[0].value,
            card_expiry_month: $('#input-month')[0].value,
            card_expiry_year: $('#input-year')[0].value,
            card_holder: $('#input-name')[0].value,
            multi_use: '0'
        };

        // console.info('_isValidCCForm(params)');
        // console.info(_isValidCCForm(params).length);

        return _isValidCCForm(params).length === 0;
    }


    /**
     *
     * @param params
     * @returns {Array}
     * @private
     */
    var _isValidCCForm = function (params) {
        var errorCollection = [];


        var errors = {'code':0, 'message':''};
        var unallowedParams = [];
        for (key in params) {
            if (HiPay.allowedParameters[key] != true) {
                unallowedParams.push(key);
            }
        }

        if (unallowedParams.length > 0) {

            errors.code = 408;
            var message = 'unallowed parameters: {'
            for (key in unallowedParams) {

                message += unallowedParams[key] + ' ';
            }
            message += '}';
            message += ' allowed parameters are: {';

            for (key in HiPay.allowedParameters) {
                message += key;
                message += ' ';
            }
            message += '}';

            errors.message = message;
        }

       // @todo changer le nom HiPay.ValidationError
        var validatorCC = new _validatorCC(errorCollection);
        if ( ! validatorCC.isValid(params['card_number']) ) {

            errorCollection = validatorCC.errorCollection;
            // errors.code = 409;
            // errors.message = 'cardNumber is invalid : luhn check failed';
        }

        var validatorExpiryDate = new ValidatorExpiryDate(errorCollection);
        if ( ! validatorExpiryDate.isValid(params['card_expiry_month'], params['card_expiry_year']) ) {

            errorCollection = validatorExpiryDate.errorCollection;
            // errors.code = 409;
            // errors.message = 'cardNumber is invalid : luhn check failed';
        }

        return errorCollection;
    };

    var _processObjectPayload = function (instance, payload, specialValueCallback) {
        var propertyConfig = [];

        for (var key in payload || {}) {

            // console.log("key");
            // console.log(key);
            //
            // console.log("instance._mapping");
            // console.log(instance._mapping);
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

            // console.log(instance[key]);
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


        // console.log('responseJSON');
        // console.log(responseJSON);
        var payload;

        if (typeof responseJSON.data !== 'undefined') {
            payload = responseJSON.data;
        }

        // console.log('payload');
        // console.log(payload);

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


        // console.log("payload");
        // console.log(payload.token);
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

    HiPay.getFormCC = function(containerId) {

        var containerHtml = document.getElementById(containerId);


        if (!containerHtml) {
            return false;
        }

        containerHtml.innerHTML += '<div style="margin-top: 50px">'
            + '<div id="my-card-1" class="card-js" data-capture-name="true" data-icon-colour="#158CBA"></div>'
            + '</div>';

    }




    // API Calls
    var _performAPICall = function (endpoint, requestParams, returnPromise, checkKey) {


        console.log(requestParams);
        if ((typeof checkKey === 'undefined' || checkKey) && (typeof HiPay.publicKey === 'undefined' || typeof HiPay.username === 'undefined')) {
            throw new _Error('missing_public_key', 'You have to provide a HiPay username and public key in order to perform API calls.');

            // {"code":'+APIInvalidCardToken+',

        }
        // console.log(typeof window.btoa === 'function');

        try{
            var authEncoded = window.btoa(HiPay.username + ':' + HiPay.publicKey);
        }catch(e) {
            throw new _Error('missing_public_key');
        }


// console.log(authEncoded);
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
        //         console.log(response.data);
        //     })
        //     .catch(function (error) {
        //         console.log(error);
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
                // console.log(requestParams);






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
        var errorCollection = _isValidCCForm(params);

        if (errorCollection.length > 0) {
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



    HiPay.Form.tokenizePaymentFormData = function() {

        if (!HiPay.Form.paymentFormDataIsValid()) {
            return false;
        }
        var params = {
            card_number: $('#input-card')[0].value,
            card_expiry_month: $('#input-month')[0].value,
            card_expiry_year: $('#input-year')[0].value,
            card_holder: $('#input-name')[0].value,
            cvv: $('#input-cvv')[0].value,
            multi_use: '0',
            generate_request_id: '0'
        };
        return HiPay.tokenize(params['card_number'], params['card_expiry_month'], params['card_expiry_year'], params['card_holder'], params['cvv'], params['multi_use'], params['generate_request_id'] )
//

    }

    return HiPay;

} (HiPay || {}));