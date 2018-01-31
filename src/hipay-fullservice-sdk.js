/**
 * HiPay Fullservice library
 *
 * # Introduction
 *
 * This module allows to create a token with credit or debit card through the HiPay API. The [source code](https://github.com/hipay/hipay-fullservice-sdk-js) is available on Github.
 *
 * <br/>
 * <br/>
 *
 * # Getting started and examples
 *
 * <br/>
 *
 * ## Setting environment type
 *
 * ```
 *  HiPay.setTarget('stage'); // default is production
 * ```
 *
 * <br/>
 *
 * ## Setting credentials to tokenize on HiPay API
 * ```
 * HiPay.setCredentials('API_CREDENTIAL_USERNAME', 'API_CREDENTIAL_PASSWORD');
 * ```
 *
 * <br/>
 *
 * ## Setting customer country to get available payment product of the selected ISO 3166-1 alpha-2 country code.
 * ```
 * HiPay.setAvailalblePaymentProductsCustomerCountry(COUNTRY_ISO3166-1_alpha-2);
 * example :
 * HiPay.setAvailalblePaymentProductsCustomerCountry('FR');
 * ```
 *
 * <br/>
 *
 * ## Setting currency to get available payment product of the selected ISO 4217 currency code
 * ```
 *  HiPay.setAvailalblePaymentProductsCurrency(CURRENCY_ISO_4217);
 *  example :
 *  HiPay.setAvailalblePaymentProductsCurrency('EUR);
 * ```
 * <br/>
 *
 * ## Payment products list enabled
 * ```
 *  HiPay.enabledPaymentProducts({Array payment product});
 *  example :
 *  HiPay.enabledPaymentProducts(['visa', 'maestro']);
 * ```
 * <br/>
 *
 * ## Set locale
 * ```
 *  HiPay.Form.setLocale({LOCALE_CODE});
 *  fr_FR or en_EN
 *  example :
 *  HiPay.enabledPaymentProducts('fr_FR');
 * ```
 * <br/>
 *
 * ## Helper to display information about the 3 or 4 digits security code that customer have to mention in the payment form.
 * The translation of this message is base on the language set with the method : HiPay.Form.setLocale();
 * ```
 *  HiPay.Form.CVVHelpText();
 *
 * ```
 * <br/>
 *
 *  ## Helper to display information about the 3 or 4 digits security code that customer have to mention in the payment form. It contains type and length of the card security code.
 *
 * ```
 *  HiPay.getCVVInformation();
 *
 * ```
 * <br/>
 *
 * ## Payment form is valid. Return true if payment form is valid or false if not.
 * ```
 *  HiPay.Form.paymentFormDataIsValid();
 *
 * ```
 * <br/>
 *
 * ## Payment form error. Return a list of error if the payment form is not valid.
 * ```
 *  HiPay.Form.paymentFormDataGetErrors();
 *
 * ```
 * <br/>
 *
 *
 * @class HiPay
 * @param {HiPay} HiPay itself.
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
     * The user locale. You need to set this value in order to translate placeholder, error message, ... in the user language if supported. The fallbackLocale value is used otherwise.
     *
     * @property HiPay.Form.locale
     * @default "en_EN"
     * @type string (fr_FR or en_EN)
     * @example
     *     HiPay.Form.locale = "fr_FR";
     */
    HiPay.Form.locale = "en_EN";

    var _endPointTokenize = {
        stage: 'https://stage-secure2-vault.hipay-tpp.com/rest/v2/token/create.json',
        production: 'https://secure2-vault.hipay-tpp.com/rest/v2/token/create.json'
    };

    var _endPointAvailablePaymentProducts = {
        stage: 'https://stage-secure-gateway.hipay-tpp.com/rest/v2/available-payment-products',
        production: 'https://stage-secure-gateway.hipay-tpp.com/rest/v2/available-payment-products'
    };

    var _separatorMonthYear = ' / ';

    var _maxYearExpiry = 30;

    var _translationJSON = {
        "en_EN" : {
            "FORM_CVV_3_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). It's the 3-digits number on the back of your card for VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE": "For security reasons, you have to enter your card security code (CVC). The AMERICAN EXPRESS security code is the 4-digits number on the front of your card.",
            "FORM_ERROR_INVALID_CARD_HOLDER": "The name field must contain maximum %NUMBER% digits.",
            "FORM_ERROR_INVALID_CARD_NUMBER": "Invalid card number.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "The expiration date is already past.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "The month field must be between 1 and 12.",
            "FORM_ERROR_INVALID_CVV": "The CVV field must contain %NUMBER% digits.",
            "FORM_ERROR_DEFAULT": "An error occured.",
            "FORM_PLACEHOLDER_CARD_NUMBER": "Ex : 5136 0000 0000 0000",
            "FORM_PLACEHOLDER_CARD_HOLDER": "FirstName LastName",
            "FORM_PLACEHOLDER_CARD_EXPIRY_DATE": "MM"+_separatorMonthYear+"YY",
            "FORM_PLACEHOLDER_CARD_CVV": "123",
            "FORM_PLACEHOLDER_CARD_CVV_AMEX": "1234"
        },
        "fr_FR" : {
            "FORM_CVV_3_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Ce code correspond aux 3 chiffres visibles au verso de votre carte VISA®, MASTERCARD® and MAESTRO®.",
            "FORM_CVV_4_HELP_MESSAGE" : "Pour des raisons de sécurité, vous devez indiquer le code de sécurité (CVC). Le code de securité AMERICAN EXPRESS est un nombre à 4 chiffres au recto de votre carte.",
            "FORM_ERROR_INVALID_CARD_HOLDER": "Le champ nom doit contenir au maximum %NUMBER% caractères.",
            "FORM_ERROR_INVALID_CARD_NUMBER": "Numéro de carte invalide.",
            "FORM_ERROR_INVALID_EXPIRY_DATE_PAST": "La date est inférieure à la date actuelle.",
            "FORM_ERROR_INVALID_MONTH_EXPIRY_DATE": "Le mois doit être compris entre 1 et 12.",
            "FORM_ERROR_INVALID_CVV": "Le champ CVV doit contenir %NUMBER% caractères.",
            "FORM_ERROR_DEFAULT": "Une erreur est survenue.",
            "FORM_PLACEHOLDER_CARD_NUMBER": "Ex : 5136 0000 0000 0000",
            "FORM_PLACEHOLDER_CARD_HOLDER": "Prénom Nom",
            "FORM_PLACEHOLDER_CARD_EXPIRY_DATE": "MM"+_separatorMonthYear+"AA",
            "FORM_PLACEHOLDER_CARD_CVV": "123",
            "FORM_PLACEHOLDER_CARD_CVV_AMEX": "1234"
        }
    };

    var _loadPaymentProduct;

    var _getLocaleTranslationWithId = function(id) {
        return _translationJSON[HiPay.Form.locale][id];
    };

    var _idInputMapper = {
        cardNumber: 'card-number',
        cardType: 'card-type',
        cardHolder: 'card-holder',
        cardExpiryDate: 'card-expiry-date',
        cardExpiryMonth: 'card-expiry-month',
        cardExpiryYear: 'card-expiry-year',
        cardCVV: 'card-cvv',
        payButton: 'pay-button'
    };

    var _idProductAPIMapper = {
        'visa': 'card_visa_info',
        'mastercard': 'card_mastercard_info',
        'diners': 'card_diners_info',
        'american-express': 'card_american_express_info',
        'maestro': 'card_maestro_info',
        'bcmc': 'card_bcmc_info'
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
        card_maestro_info: "ic_credit_card_maestro.png",
        card_bcmc_info: "ic_credit_card_bcmc.png"
    };

    var _creditCardCVVMaxLength = 3;

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
        },
        card_bcmc_info:
        {
            "ranges": [
                {
                    "first": 670300,
                    "variable": 100
                }
            ],
            "lengths": {
                "length": 16,
                "variable": 3
            },
            "format": [4, 4, 4, 4, 1]
        }
    };

    function _testSelector(selector) {
        try {
            return document.querySelector(selector) !== null;
        } catch(e) { return false; }
    };

    function _focusNextElement() {

        var focussableElements = "button:not([disabled]), input:not([disabled]):not([tabindex='-1'])";
        var focussableElementsOldBrowser = "button, input[data-hipay-tabable='true']";

        if (document.activeElement) {
            if (_testSelector(focussableElements)) {
                var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
                    function (element) {
                        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                    });
            } else {
                var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElementsOldBrowser),
                    function (element) {
                        return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                    });
            }

            var index = focussable.indexOf(document.activeElement);
            focussable[index + 1].focus();
        } else {
            element.nextElementSibling.focus();
        }
    };

    function isIE () {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

    function evtIsPrintable(evt) {
        if (typeof evt.which == "undefined") {
            return true;
        } else if (typeof evt.which == "number" && evt.which > 0) {
            return !evt.ctrlKey && !evt.metaKey && !evt.altKey && evt.which != 8;
        }

        return false;
    };

    var _isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

    var _extend = function () {
        // Variables btoa
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

            /*
             * The target type stage or production to make HiPay API calls in stage or production environment.
             *
             * @property target
             * @default "production"
             * @type string (stage or production)
             * @example
             *      HiPay.target = "stage";
             */
            target: {enumerable: true, writable: true, value:'production'},

            /*
             * The username. You must provide this value in order to be able to make API calls.
             *
             * @property username
             * @type string
             */
            username: {enumerable: false, writable: true},

            /*
             * The user public key. You must provide this value in order to be able to make API calls.
             *
             * @property password
             * @type string
             */
            password: {enumerable: false, writable: true}
        });
    } else {
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
    }

    // Define property helper
    var _defineProperties = function(object, properties) {
        for (var key in properties) {
            properties[key].propertyDescriptors = _extend({}, {enumerable: true, writable: false, configurable: false}, properties[key].propertyDescriptors || {});
        }

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
                var val =  instance._mapping[key];
                propertyConfig[val.name] = _extend({}, true, val.propertyDescriptors.clone, {
                    writable: true,
                    configurable: true
                });
            }
            Object.defineProperties(instance, propertyConfig);
        }
    };

    var _setCaretPosition = function(ctrl,pos) {
        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos,pos);
        } else if (ctrl.createTextRange) {
            var range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    };

    var _getSelection = function (target) {
        var s = {
            start: 0,
            end:0
        };

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
    };

    var _instanceServiceCreditCard = null;

    var _serviceCreditCard = function(charCode) {
        var serviceCreditCard = {};

        serviceCreditCard.creditCardHolderLengthMax = 60;
        serviceCreditCard.creditCardCVVLengthMax = _creditCardCVVMaxLength;
        serviceCreditCard.cardFormatArray = [];

        serviceCreditCard.getCreditCardHolderInput = function() {
            return _selectElementWithHipayId(_idInputMapper.cardHolder);
        };

        serviceCreditCard.getCreditCardNumberInput = function() {
            return _selectElementWithHipayId(_idInputMapper.cardNumber);
        };

        serviceCreditCard.getCreditCardNumberValue = function() {
            return _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
        };

        serviceCreditCard.getCreditCardCVVLengthMax = function(forceReload) {
            if (typeof serviceCreditCard.creditCardCVVLengthMax == "undefined"
                || typeof forceReload == "undefined"
                || forceReload == true
            ) {
                var arrayFormatCVV = ['34', '35', '36', '37'];
                var creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
                for (var indexFormatCVV = 0; indexFormatCVV < arrayFormatCVV.length; indexFormatCVV++) {
                    if (creditCardNumber != ""
                        && typeof arrayFormatCVV[indexFormatCVV]  != "undefined"
                        && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0
                    ) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }
            }

            return serviceCreditCard.creditCardCVVLengthMax;
        };

        serviceCreditCard.setCreditCardCVVMaxLength = function(cardCVVMaxLength) {
            _creditCardCVVMaxLength = cardCVVMaxLength;
        };

        serviceCreditCard.getCardTypeId = function() {
            serviceCreditCard.initInfoCardWithCardNumber();
            return serviceCreditCard.idType;
        };

        serviceCreditCard.getTypeWithCardNumber = function(creditCardNumber) {
            var creditCardNumberUnformatted;

            if (typeof creditCardNumber != "undefined") {
                creditCardNumberUnformatted = creditCardNumber.split(' ').join('');
            }

            var cardType;
            var countMatchType = 0;

            for (var propt in _cardFormatDefinition) {
                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {
                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumberUnformatted.indexOf(startNumber) === 0) {
                                serviceCreditCard.idType = propt;
                                cardType = propt;
                                countMatchType++;
                            }
                        }
                    } else {
                        if (creditCardNumberUnformatted.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            serviceCreditCard.idType = propt;
                            cardType = propt;
                            countMatchType++;
                        }
                    }
                }
            }

            return cardType;
        };

        serviceCreditCard.initInfoCardWithCardNumber = function(creditCardNumber) {

            var creditCardNumberUnformatted;
            var countMatchType = 0;
            var idType;
            var cardFormatArray;

            if (typeof creditCardNumber  == "undefined") {
                creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
            }

            if (typeof creditCardNumber != "undefined") {
                creditCardNumberUnformatted = creditCardNumber.split(' ').join('');
            }

            if (_selectElementWithHipayId(_idInputMapper['cardType'])) {
                _selectElementWithHipayId(_idInputMapper['cardType']).src = "";
                _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'display:none;');
                _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'visibility:hidden;');
            }

            for (var propt in _cardFormatDefinition) {
                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {

                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (creditCardNumberUnformatted.indexOf(startNumber) === 0) {
                                idType = propt;
                                countMatchType++;
                            }
                        }
                    } else {
                        if (creditCardNumberUnformatted.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            idType = propt;
                            countMatchType++;
                        }
                    }
                }
            }

            if (idType) {
                serviceCreditCard.idType = idType;
                if (_selectElementWithHipayId(_idInputMapper['cardType'])) {
                    _selectElementWithHipayId(_idInputMapper['cardType']).src = "./img/type/" + _cardImg[idType];
                    _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'display:block;');
                    _selectElementWithHipayId(_idInputMapper['cardType']).setAttribute('style', 'visibility:visible;');
                    _updatePlaceholderCVV(serviceCreditCard.idType);
                }

                serviceCreditCard.cardFormatArray = _cardFormatDefinition[idType]["format"];
                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[idType]["lengths"]["length"];

                if (_cardFormatDefinition[idType]["lengths"]["variable"] != null) {
                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[idType]["lengths"]["variable"];
                }
            }
        };

        serviceCreditCard.unformatCreditCardNumber = function(cardNumberStringFormatted) {
            if (typeof cardNumberStringFormatted != "undefined") {
                return cardNumberStringFormatted.split(' ').join('');
            }

            return cardNumberStringFormatted;
        };

        var _inputCCNumberFinish = function(element) {
            var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber([]);

            if (_selectElementWithHipayId(_idInputMapper['cardCVV'])) {
                _selectElementWithHipayId(_idInputMapper['cardCVV']).disabled = false;
            }

            if (serviceCreditCard.cardNumberStringFormatAfter != '') {
                if (serviceCreditCard.idType == 'card_bcmc_info') {
                    var cvvElement =  _selectElementWithHipayId(_idInputMapper.cardCVV);

                    if (null !== cvvElement) {
                        cvvElement.value = "";

                        if (!cvvElement.classList.contains('inputdisabled')) {
                            cvvElement.classList.add('inputdisabled');
                        } else {
                            cvvElement.classList.remove('inputdisabled');
                        }

                        cvvElement.disabled = true;
                    }
                }
            }

            if (serviceCreditCard.cardNumberStringFormatAfter != ''
                && validatorCreditCardNumber.isValid( _selectElementValueWithHipayId(_idInputMapper['cardNumber']))
            ) {
                _focusNextElement();
            }
        };

        var _inputCardExpiryDateFinish = function(element) {
            var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate([]);
            var lengthCardExpiry = 4 + _separatorMonthYear.length;

            if (_selectElementValueWithHipayId(_idInputMapper['cardExpiryDate'])
                && lengthCardExpiry == _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']).length
                && validatorCreditCardExpiryDate.isValid( _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate'])) === true
            ) {
                _focusNextElement();
            }
        };

        serviceCreditCard.validatorCreditCardNumber = function(errorArray) {
            var validatorCreditCardNumber = {};
            validatorCreditCardNumber.errorCollection = errorArray || [];

            validatorCreditCardNumber.isPotentiallyValid = function(creditCardNumber) {
                var creditCardNumberUnformatted;

                if (typeof creditCardNumber != "undefined") {
                    creditCardNumberUnformatted = creditCardNumber.split(' ').join('');
                }

                var isPotentiallyValid = false;
                var startNumberArray = [];

                for (var propt in _cardFormatDefinition) {
                    for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                        if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {
                            for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                                startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"] + j, propt]);
                            }
                        } else {
                            startNumberArray.push([_cardFormatDefinition[propt]["ranges"][i]["first"], propt]);

                        }
                    }
                }

                var startNumber;
                var startNumberToCompare;
                var cardNumberMaxLength = 23;
                var propt;

                for (var indexNumber = 0; indexNumber < startNumberArray.length; indexNumber++) {
                    startNumber = startNumberArray[indexNumber][0].toString();
                    propt = startNumberArray[indexNumber][1].toString();
                    if (startNumber) {
                        startNumberToCompare = startNumber.substr(0, Math.min(startNumber.length, creditCardNumber.length));
                        if (startNumberToCompare && creditCardNumber.indexOf(startNumberToCompare) === 0) {
                            cardNumberMaxLength = _cardFormatDefinition[propt]["lengths"]["length"];
                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                cardNumberMaxLength = cardNumberMaxLength + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }
                            if (creditCardNumberUnformatted.length < cardNumberMaxLength) {
                                isPotentiallyValid = true;
                                break;
                            } else if (creditCardNumberUnformatted.length == cardNumberMaxLength) {
                                if (_isLuhnValid(creditCardNumberUnformatted) === true) {
                                    isPotentiallyValid = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (typeof serviceCreditCard.getCardTypeId() != "undefined"
                    && _isEnabled(serviceCreditCard.getCardTypeId()) === false
                ) {
                    isPotentiallyValid = false;
                }

                if (isPotentiallyValid == false) {
                    validatorCreditCardNumber.isValid(creditCardNumber);
                }

                return isPotentiallyValid;
            };

            validatorCreditCardNumber.isValid = function (creditCardNumberUnformatted) {
                if (typeof creditCardNumberUnformatted != "undefined") {
                    creditCardNumberUnformatted = creditCardNumberUnformatted.split(' ').join('');
                }

                if (_isEnabled(serviceCreditCard.getCardTypeId()) === false) {
                    validatorCreditCardNumber.errorCollection.push(new _InvalidParametersError(50,  _getLocaleTranslationWithId('FORM_ERROR_INVALID_CARD_NUMBER')));
                    _selectElementWithHipayId(_idInputMapper.cardType).setAttribute('style','display:none;');
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
                        if (_idProductAPIMapper[_availableAndEnabledPaymentProductsCollection[indexEnableProduct]] == cardTypeId) {
                            return true;
                        }
                    }
                }

                return false;
            };

            var _isTypeValid = function(cardTypeId) {
                if (_cardFormatDefinition.hasOwnProperty(cardTypeId) === false) {
                    return false;
                }
            };

            var _isLengthValid = function (value) {
                if (value.length < serviceCreditCard.cardLengthMin
                    || (serviceCreditCard.cardLengthMax != null
                        && value.length > serviceCreditCard.cardLengthMax
                    )
                ) {
                    return false;
                }

                return true;
            };

            var _isLuhnValid = function (value) {
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
                if (creditCardHolderString == ""
                    || typeof creditCardHolderString == "undefined"
                    || creditCardHolderString == null
                ) {
                    return false;
                }

                if (creditCardHolderString
                    && creditCardHolderString.length > serviceCreditCard.creditCardHolderLengthMax
                ) {
                    validatorCreditCardHolder.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CARD_HOLDER").replace("%NUMBER%", serviceCreditCard.creditCardHolderLengthMax)));

                    return false;
                }

                return true;
            };

            validatorCreditCardHolder.isPotentiallyValid = function(creditCardHolderString) {
                var isPotentiallyValid = false;

                if (creditCardHolderString && creditCardHolderString.length <= serviceCreditCard.creditCardHolderLengthMax ) {
                    isPotentiallyValid = true;
                }

                if (isPotentiallyValid == false) {
                    validatorCreditCardHolder.isValid(creditCardHolderString);
                }

                return isPotentiallyValid;
            };

            return validatorCreditCardHolder;
        };

        serviceCreditCard.validatorCreditCardExpiryDate = function (errorCollection) {
            var validatorExpiryDate = {};
            validatorExpiryDate.errorCollection = errorCollection || [];

            validatorExpiryDate.isPotentiallyValid = function(creditCardExpiryDate) {
                var isPotentiallyValid = false;

                if (!creditCardExpiryDate) {
                    return;
                }

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
                            var currentTime = new Date();
                            var currentMonth = currentTime.getMonth() + 1;
                            var currentYear = currentTime.getFullYear();
                            var yearYYYY = "20" + year;

                            if (yearYYYY > currentYear
                                && yearYYYY <= (currentYear + _maxYearExpiry)
                            ) {
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

                if (typeof creditCardExpiryDate == "undefined") {
                    creditCardExpiryDate = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);
                }

                if (!creditCardExpiryDate) {
                    return false;
                }

                var splitExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
                if (splitExpiryDate.length != 2) {
                    validatorExpiryDate.errorCollection.push(new _InvalidParametersError(50, 'format de date non valide'));
                    return false;
                }

                var month = splitExpiryDate[0];
                var year = splitExpiryDate[1];
                var currentTime = new Date();
                var currentMonth = currentTime.getMonth() + 1;
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

                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++) {
                    if (_selectElementValueWithHipayId(_idInputMapper['cardNumber']) != ""
                        && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0
                    ) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }

                if (typeof creditCardCVVString != "undefined"
                    && creditCardCVVString != ""
                    && creditCardCVVString.length <= serviceCreditCard.creditCardCVVLengthMax
                ) {
                    isPotentiallyValid = true;
                }

                if (serviceCreditCard.idType == _idProductAPIMapper.bcmc && creditCardCVVString == "") {
                    isPotentiallyValid = true;
                }

                if (isPotentiallyValid == false) {
                    isPotentiallyValid = validatorCreditCardCVV.isValid(creditCardCVVString);
                }

                return isPotentiallyValid;
            };

            validatorCreditCardCVV.isValid = function (creditCardCVVString) {
                if (serviceCreditCard.idType == _idProductAPIMapper.bcmc) {
                    return true;
                }

                if (creditCardCVVString == "" || typeof creditCardCVVString == "undefined" || creditCardCVVString == null) {
                    return false;
                }

                var creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
                var arrayFormatCVV = ['34','35','36','37'];

                for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++) {
                    if (creditCardNumber != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                        serviceCreditCard.creditCardCVVLengthMax = 4;
                    }
                }

                if (typeof creditCardCVVString != "undefined" && creditCardCVVString.length > serviceCreditCard.creditCardCVVLengthMax ) {
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));
                    return false;
                }

                if ((typeof validateAll == "undefined" || validateAll == true) && creditCardCVVString != undefined && creditCardCVVString.length < serviceCreditCard.creditCardCVVLengthMax ) {
                    validatorCreditCardCVV.errorCollection.push(new _InvalidParametersError(50, _getLocaleTranslationWithId("FORM_ERROR_INVALID_CVV").replace("%NUMBER%", serviceCreditCard.creditCardCVVLengthMax)));
                    return false;
                }

                return true;
            };

            return validatorCreditCardCVV;
        };

        serviceCreditCard.validatorCreditCard = function(errorCollection) {
            var validatorCreditCard = {};
            validatorCreditCard.errorCollection = [];

            validatorCreditCard.isValid = function(params) {
                var hasError = false;
                var validatorCreditCardNumber = serviceCreditCard.validatorCreditCardNumber();

                if (!validatorCreditCardNumber.isValid(serviceCreditCard.unformatCreditCardNumber(params['card_number']))) {
                    validatorCreditCard.errorCollection['creditCardNumber'] = validatorCreditCardNumber.errorCollection;
                    hasError = true;
                }

                var validatorCreditCardHolder = serviceCreditCard.validatorCreditCardHolder(validatorCreditCard.errorCollection);
                if (!validatorCreditCardHolder.isValid(params['card_holder'])) {
                    hasError = true;
                }

                var validatorCreditCardExpiryDate = serviceCreditCard.validatorCreditCardExpiryDate(validatorCreditCard.errorCollection);
                if (!validatorCreditCardExpiryDate.isValid(params['card_expiry_date'])) {
                    hasError = true;
                }

                var validatorCreditCardCVV = serviceCreditCard.validatorCreditCardCVV(validatorCreditCard.errorCollection);
                if (!validatorCreditCardCVV.isValid(params['cvc'])) {
                    hasError = true;
                }

                if (hasError) {
                    return false;
                }

                return true;
            };

            return validatorCreditCard;
        };

        serviceCreditCard.initCreditCardNumber = function(charCode, stringPaste){
            serviceCreditCard.lastCharCode = charCode;

            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharString = '';
            } else {
                serviceCreditCard.lastCharString = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardNumberStringFormatBefore = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);
            serviceCreditCard.cardNumberStringFormatedBefore = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);

            var splitFormatBeforetemp = serviceCreditCard.cardNumberStringFormatBefore;
            serviceCreditCard.cardNumberStringUnformatedBefore = splitFormatBeforetemp.split(' ').join('');

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper.cardNumber));

            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;

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

            var newTempStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;

            if (stringPaste) {
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
                    if (stringPaste) {
                        startAtemp = startAtemp + stringPaste.length;
                    } else {
                        tempStringAfter += serviceCreditCard.lastCharString;
                        startAtemp = startAtemp + 1;
                    }
                }
                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            serviceCreditCard.cardLengthMin = 0;
            serviceCreditCard.cardLengthMax = 25;
            serviceCreditCard.idType = null;

            for (var propt in _cardFormatDefinition) {
                for (var i = 0; i < _cardFormatDefinition[propt]["ranges"].length; i++) {
                    if (_cardFormatDefinition[propt]["ranges"][i]["variable"] != null) {
                        for (var j = 0; j < _cardFormatDefinition[propt]["ranges"][i]["variable"]; j++) {
                            var startNumber = _cardFormatDefinition[propt]["ranges"][i]["first"] + j;
                            if (tempStringAfter.indexOf(startNumber) === 0) {
                                serviceCreditCard.idType = propt;
                                var my_elem = _selectElementWithHipayId(_idInputMapper.cardNumber);

                                serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                                serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];

                                if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                    serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                                }
                                break;
                            }
                        }
                    } else {
                        if (tempStringAfter.indexOf(_cardFormatDefinition[propt]["ranges"][i]["first"]) === 0) {
                            serviceCreditCard.idType = propt;
                            serviceCreditCard.cardFormatArray = _cardFormatDefinition[propt]["format"];
                            serviceCreditCard.cardLengthMin = serviceCreditCard.cardLengthMax = _cardFormatDefinition[propt]["lengths"]["length"];

                            if (_cardFormatDefinition[propt]["lengths"]["variable"] != null) {
                                serviceCreditCard.cardLengthMax = serviceCreditCard.cardLengthMin + _cardFormatDefinition[propt]["lengths"]["variable"];
                            }
                            break;
                        }
                    }
                }
            }

            if (serviceCreditCard.cardLengthMax == null || tempStringAfter.length <= serviceCreditCard.cardLengthMax) {
                serviceCreditCard.cardNumberStringAfter = tempStringAfter;
            } else {
                if (stringPaste) {
                    serviceCreditCard.cardNumberStringAfter = tempStringAfter.substr(0,serviceCreditCard.cardLengthMax);
                } else {
                    serviceCreditCard.cardNumberStringAfter = serviceCreditCard.cardNumberStringUnformatedBefore;
                    startA = startB;
                }
            }

            var tempForStringAfter = "";

            if (serviceCreditCard.cardFormatArray.length > 0) {
                var positionSpaceArray = [];
                var startFormat = 0;

                for (var i = 0; i < serviceCreditCard.cardFormatArray.length; i++) {
                    positionSpaceArray[(startFormat + serviceCreditCard.cardFormatArray[i])] = 1;
                    startFormat += serviceCreditCard.cardFormatArray[i];
                }
            }

            var numberSpaceBeforeStartFormated = 0;
            for (var nb=0; nb< serviceCreditCard.cardNumberStringAfter.length;nb++) {
                if (typeof positionSpaceArray != "undefined" && positionSpaceArray[nb]===1) {
                    if (nb < startA) {
                        numberSpaceBeforeStartFormated +=1;
                    }
                    tempForStringAfter += ' ';
                }
                tempForStringAfter += serviceCreditCard.cardNumberStringAfter.charAt(nb);
            }

            serviceCreditCard.cardNumberStringFormatAfter = tempForStringAfter;

            var startAFormat = startA + numberSpaceBeforeStartFormated;

            _setElementValueWithHipayId(_idInputMapper.cardNumber, serviceCreditCard.cardNumberStringFormatAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper.cardNumber), startAFormat);
            _inputCCNumberFinish( _selectElementWithHipayId(_idInputMapper.cardHolder), serviceCreditCard);
        };

        serviceCreditCard.initCreditCardHolder = function(charCode,stringPaste) {
            serviceCreditCard.lastCharCodeCreditCardHolder = charCode;
            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardHolder = '';
            } else {
                serviceCreditCard.lastCharStringCreditCardHolder = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardHolderStringFormatedBefore = _selectElementValueWithHipayId(_idInputMapper['cardHolder']);

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper.cardHolder));

            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;
            var subStringStart =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, startBFormat);
            var subStringEnd =  serviceCreditCard.cardHolderStringFormatedBefore.substr(0, endBFormat);
            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);
            var startA = startB;
            var endA = endB;
            var newTempStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;

            if (stringPaste) {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = stringPaste.length;
                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }
            } else {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                } else if (startB > 0) {
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

            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++) {
                if (nbBefore == startA) {
                    if (charCode == 8 || charCode == 46) {


                    } else {
                        if (stringPaste) {
                            startAtemp = startAtemp + stringPaste.length;
                        } else {
                            tempStringAfter += serviceCreditCard.lastCharStringCreditCardHolder;
                            // realCursorPositionInNumberAfter = realCursorPositionInNumberBefore + 1;
                            startAtemp = startAtemp + 1;
                        }
                    }
                }

                tempStringAfter += newTempStringAfter.charAt(nbBefore);

            }
            startA = startAtemp;

            if (serviceCreditCard.creditCardHolderLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardHolderLengthMax) {
                serviceCreditCard.cardHolderStringAfter = tempStringAfter;
            } else {
                if (charCode == 8 || charCode == 46) {
                    serviceCreditCard.cardHolderStringAfter = tempStringAfter;
                } else {
                    if (stringPaste) {
                        serviceCreditCard.cardHolderStringAfter = tempStringAfter;
                    } else {
                        serviceCreditCard.cardHolderStringAfter = serviceCreditCard.cardHolderStringFormatedBefore;
                        startA = startBFormat;
                    }
                }
            }

            _setElementValueWithHipayId(_idInputMapper.cardHolder, serviceCreditCard.cardHolderStringAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper.cardHolder), startA);
        };

        serviceCreditCard.initCreditCardExpiryDate = function(charCode, stringPaste){
            serviceCreditCard.lastCharCodeCreditCardExpiryDate = charCode;

            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = '';
            } else {
                serviceCreditCard.lastCharStringCreditCardExpiryDate = String.fromCharCode(charCode);
            }

            serviceCreditCard.creditCardExpiryDateFormattedBefore = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);

            var splitFormatBeforetemp = serviceCreditCard.creditCardExpiryDateFormattedBefore;
            serviceCreditCard.creditCardExpiryDateUnformattedBefore = splitFormatBeforetemp.split(_separatorMonthYear).join('');

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper['cardExpiryDate']));

            // position avant action avec formatage.
            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;
            var subStringStart =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, startBFormat);
            var splitSubStringStart = subStringStart.split(_separatorMonthYear);
            var nbSpaceStart = (splitSubStringStart.length - 1)*_separatorMonthYear.length;
            var subStringEnd =  serviceCreditCard.creditCardExpiryDateFormattedBefore.substr(0, endBFormat);
            var splitSubStringEnd = subStringEnd.split(_separatorMonthYear);
            var nbSpaceEnd = (splitSubStringEnd.length - 1)*_separatorMonthYear.length;
            var startB = parseInt(startBFormat) - parseInt(nbSpaceStart);
            var endB = parseInt(endBFormat) - parseInt(nbSpaceEnd);

            if (startBFormat > 2 && startBFormat <= (2 + _separatorMonthYear.length)) {
                startB = 2;
            }

            if (endBFormat > 2 && endBFormat <= (2 + _separatorMonthYear.length)) {
                endB = 2;
            }

            var startA = startB;
            var endA = endB;
            var newTempStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;

            if (stringPaste) {
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
                } else if (startB > 0) {
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

            for (var nbBefore = 0; nbBefore <= newTempStringAfter.length;nbBefore++) {
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
            } else {
                serviceCreditCard.cardExpiryDateStringAfter = serviceCreditCard.creditCardExpiryDateUnformattedBefore;
                startA = startBFormat;
            }

            if (serviceCreditCard.cardExpiryDateStringAfter.length === 1) {
                if (charCode != 8 && charCode != 46) {
                    if (serviceCreditCard.cardExpiryDateStringAfter.charAt(0) > 1) {
                        serviceCreditCard.cardExpiryDateStringAfter = "0" + serviceCreditCard.cardExpiryDateStringAfter;
                        startA = startA + 1;
                    }
                }
            }
            serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringAfter;

            if (serviceCreditCard.cardExpiryDateStringAfter.length >= 2) {
                serviceCreditCard.cardExpiryDateStringFormattedAfter = serviceCreditCard.cardExpiryDateStringFormattedAfter.substring(0, 2) + _separatorMonthYear + serviceCreditCard.cardExpiryDateStringAfter.substring(2, serviceCreditCard.cardExpiryDateStringFormattedAfter.length);
                if (charCode != 8) {
                    startA = startA + _separatorMonthYear.length;
                } else {
                    if (startA >= 2) {
                        startA = startA + _separatorMonthYear.length;
                    }
                }
            }

            _setElementValueWithHipayId(_idInputMapper['cardExpiryDate'], serviceCreditCard.cardExpiryDateStringFormattedAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper['cardExpiryDate']), startA);
            _inputCardExpiryDateFinish( _selectElementWithHipayId(_idInputMapper.cardCVV), serviceCreditCard);
        };

        serviceCreditCard.initCreditCardCVV = function(charCode, stringPaste){
            serviceCreditCard.lastCharCodeCreditCardCVV = charCode;

            if (typeof charCode == "undefined" || charCode == '' || charCode == 8 || charCode == 46) {
                serviceCreditCard.lastCharStringCreditCardCVV = '';
            } else {
                serviceCreditCard.lastCharStringCreditCardCVV = String.fromCharCode(charCode);
            }

            serviceCreditCard.cardCVVStringFormatedBefore = _selectElementValueWithHipayId(_idInputMapper['cardCVV']);

            var getStartEndCursor = _getSelection(_selectElementWithHipayId(_idInputMapper.cardCVV));

            var startBFormat = getStartEndCursor.start;
            var endBFormat = getStartEndCursor.end;
            var subStringStart =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, startBFormat);
            var subStringEnd =  serviceCreditCard.cardCVVStringFormatedBefore.substr(0, endBFormat);
            var startB = parseInt(startBFormat);
            var endB = parseInt(endBFormat);
            var startA = startB;
            var endA = endB;

            var newTempStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;

            if (stringPaste) {
                stringPaste = stringPaste.replace(/[^0-9]/g, '');

                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + stringPaste + newTempStringAfter.substring(endB, newTempStringAfter.length);
                } else if (startB >= 0) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + stringPaste + newTempStringAfter.substring(startB, newTempStringAfter.length);
                    endA = stringPaste.length;
                }
                var startBFormat = startB + stringPaste.length;

                if (newTempStringAfter.length >= 4) {
                    newTempStringAfter =newTempStringAfter.substring(0,4);
                }
            } else {
                if (startB >= 0 && endB > 0 && startB < endB) {
                    newTempStringAfter = newTempStringAfter.substring(0, startB) + "" + newTempStringAfter.substring(endB, newTempStringAfter.length);
                    endA = startA;
                } else if (startB > 0) {
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
                        startAtemp = startAtemp + 1;
                    }
                }
                tempStringAfter += newTempStringAfter.charAt(nbBefore);
            }
            startA = startAtemp;

            var arrayFormatCVV = ['34','35','36','37'];
            var creditCardNumber = _selectElementValueWithHipayId(_idInputMapper['cardNumber']);

            for (var indexFormatCVV = 0; indexFormatCVV <= arrayFormatCVV.length;indexFormatCVV++ ) {
                if (creditCardNumber != "" && creditCardNumber.indexOf(arrayFormatCVV[indexFormatCVV]) === 0) {
                    serviceCreditCard.creditCardCVVLengthMax = 4;
                }
            }

            if (serviceCreditCard.creditCardCVVLengthMax == null || tempStringAfter.length <= serviceCreditCard.creditCardCVVLengthMax) {
                serviceCreditCard.cardCVVStringAfter = tempStringAfter;
            } else {
                if (stringPaste) {
                    serviceCreditCard.cardCVVStringAfter = tempStringAfter.substr(0,serviceCreditCard.creditCardCVVLengthMax);
                } else {
                    serviceCreditCard.cardCVVStringAfter = serviceCreditCard.cardCVVStringFormatedBefore;
                    startA = startBFormat;
                }
            }

            _setElementValueWithHipayId(_idInputMapper.cardCVV, serviceCreditCard.cardCVVStringAfter);
            _setCaretPosition(_selectElementWithHipayId(_idInputMapper.cardCVV), startA);
        };
        return serviceCreditCard;
    }


    var _addClassOnElement = function(elements, myClass) {
        if (!elements) { return; }

        if (typeof(elements) === 'string') {
            elements = document.querySelectorAll(elements);
        } else if (elements.tagName) { elements=[elements]; }

        for (var i=0; i<elements.length; i++) {
            if ((' '+elements[i].className+' ').indexOf(' '+myClass+' ') < 0) {
                elements[i].className += ' ' + myClass;
            }
        }
    };

    var _removeClassOnElement = function(elements, myClass) {

        if (!elements) {
            return;
        }

        if (typeof(elements) === 'string') {
            elements = document.querySelectorAll(elements);
        } else if (elements.tagName) {
            elements=[elements];
        }

        var reg = new RegExp('(^| )'+myClass+'($| )','g');

        for (var i=0; i<elements.length; i++) {
            elements[i].className = elements[i].className.replace(reg,' ');
        }
    };

    var _containsClassOnElement = function(elements, myClass) {
        if (!elements) {
            return;
        }

        if (typeof(elements) === 'string') {
            elements = document.querySelectorAll(elements);
        } else if (elements.tagName) {
            elements = [elements];
        }

        var containsClass = false;
        for (var i=0; i<elements.length; i++) {
            if ((' '+elements[i].className+' ').indexOf(' '+myClass+' ') > 0) {
                containsClass = true;
            }
        }

        return containsClass;
    };

    var _callbackEventFormChange = new Function();

    /**
     *
     * @private
     */
    var _initErrorHandler = function(e) {
        for (var indexInput in _idInputMapper) {
            if (indexInput != "cardType" && _selectElementWithHipayId(_idInputMapper[indexInput]) != null) {
                if (_selectElementWithHipayId(_idInputMapper[indexInput]).classList.contains == "function") {
                    if (_selectElementWithHipayId(_idInputMapper[indexInput]).classList.contains('error-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexInput]).classList.remove('error-card-form');
                    }
                    if (!_selectElementWithHipayId(_idInputMapper[indexInput]).classList.contains('default-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexInput]).classList.add('default-card-form');
                    }
                } else {
                    if (_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'error-card-form')) {
                        _removeClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'error-card-form');
                    }
                    if (!_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'default-card-form')) {
                        _addClassOnElement(_selectElementWithHipayId(_idInputMapper[indexInput]), 'default-card-form');
                    }

                }
            }
        }

        var errors = HiPay.Form.paymentFormDataGetErrors();

        for (var indexError in errors) {
            if (_selectElementWithHipayId(_idInputMapper[indexInput]) != null) {
                if (_selectElementWithHipayId(_idInputMapper[indexError]).classList.contains == "function") {
                    if (!_selectElementWithHipayId(_idInputMapper[indexError]).classList.contains('error-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexError]).classList.add('error-card-form');
                    }
                    if (_selectElementWithHipayId(_idInputMapper[indexError]).classList.contains('default-card-form')) {
                        _selectElementWithHipayId(_idInputMapper[indexError]).classList.remove('default-card-form');
                    }
                } else {
                    if (!_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'error-card-form')) {
                        _addClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'error-card-form');
                    }
                    if (_containsClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'default-card-form')) {
                        _removeClassOnElement(_selectElementWithHipayId(_idInputMapper[indexError]), 'default-card-form');
                    }
                }
            }
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
        for (var eventIndex = 0; eventIndex < eventList.length; eventIndex++) {
            if (_selectElementWithHipayId(idElement) != null) {
                _addFieldListener(_selectElementWithHipayId(idElement), eventList[eventIndex], function (e) {
                    fn();
                }, false);
            }
        }
    };

    var _selectElementWithHipayId = function(idHiPay) {
        if (idHiPay == null || typeof idHiPay == "undefined") {
            return;
        }

        var selectorString = "*[data-hipay-id='"+idHiPay+"']";

        if (_testSelector(selectorString)) {
            return document.querySelector(selectorString);
        } else {
            var selectorInput = "input";
            if (!document.querySelector) {
                alert("no selector");
            }

            if (_testSelector(selectorInput)) {
                if (document.querySelector(selectorInput)) {
                    return document.querySelector( "input[data-hipay-id='"+idHiPay+"']");
                } else if(document.querySelector( "img[data-hipay-id='"+idHiPay+"']")) {
                    document.querySelector( "img[data-hipay-id='"+idHiPay+"']");
                }
            }
        }
    };

    var _selectElementValueWithHipayId = function(idHiPay) {
        if (_selectElementWithHipayId(idHiPay)) {
            return _selectElementWithHipayId(idHiPay).value;
        }
    };

    var _setElementValueWithHipayId = function(idHiPay, value) {
        if (_selectElementWithHipayId(idHiPay)) {
            _selectElementWithHipayId(idHiPay).value = value;
            if (_selectElementWithHipayId(idHiPay).blur) {
                _selectElementWithHipayId(idHiPay).blur();
            }
            if (_selectElementWithHipayId(idHiPay).focus) {
                _selectElementWithHipayId(idHiPay).focus();
            }
        }
    };

    /**
     *
     * @param idElement
     * @private
     */
    var _initListenEvent = function(idElement){
        _addListenerMulti(idElement, 'keydown keypress paste blur focus', _initErrorHandler);
    };

    var _initPlaceholder = function() {
        for (var propt in _idInputMapper) {
            if (_selectElementWithHipayId(_idInputMapper[propt]) != null && _selectElementWithHipayId(_idInputMapper[propt]).placeholder == "") {
                switch (propt) {
                    case 'cardNumber':
                        _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_NUMBER");
                        break;
                    case 'cardHolder':
                        _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_HOLDER");
                        break;
                    case 'cardExpiryDate':
                        _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_EXPIRY_DATE");
                        break;
                    case 'cardCVV':
                        if (_selectElementValueWithHipayId(_idInputMapper["cardType"]) === _idProductAPIMapper['american-express']) {
                            _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV_AMEX");
                        } else {
                            _selectElementWithHipayId(_idInputMapper[propt]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV");
                        }
                        break;
                }
            }
        }
    };

    var _updatePlaceholderCVV = function(cardTypeId) {
        if (_selectElementWithHipayId(_idInputMapper["cardCVV"])) {
            if (cardTypeId && cardTypeId === _idProductAPIMapper['american-express']) {
                _selectElementWithHipayId(_idInputMapper["cardCVV"]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV_AMEX");
            } else {
                _selectElementWithHipayId(_idInputMapper["cardCVV"]).placeholder = _getLocaleTranslationWithId("FORM_PLACEHOLDER_CARD_CVV");
            }
        }
    };

    var _eventHandlersFields = {};

    var _addFieldListener = function (node, event, handler, capture) {
        if (typeof node == "undefined") {
            return;
        }

        if (node.attachEvent) {
            node.attachEvent("on" + event, handler);
        } else {
            node.addEventListener(event, handler, capture);  // all browsers and IE9+
        }
    };

    var _initAllFieldsEventListener = function() {
        _initCardNumberFieldEventListener();
        _initCardHolderFieldEventListener();
        _initCardExpiryDateFieldEventListener();
        _initCVVFieldEventListener();
        _initCardExpiryMonthFieldEventListener();
        _initCardExpiryYearFieldEventListener();
    }

    var _initCardNumberFieldEventListener = function() {
        var propt = 'cardNumber';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        var cardNumberHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardNumber(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardNumberHandlerKeydown, false);

        var cardNumberHandlerPaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";

            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');

            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardNumber("", pastedText);
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardNumberHandlerPaste, false);

        var cardNumberHandlerCut = function (e) {
            setTimeout(function(){
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardNumber("");
                _callbackEventFormChange();
            }, 0);
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'cut', cardNumberHandlerCut, false);

        var cardNumberHandlerKeypress = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (evtIsPrintable(evt)) {
                if (!evt.ctrlKey) {
                    evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                }
                if (charCode >= 48 && charCode <= 57) {
                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardNumber(charCode);
                }
                _callbackEventFormChange();
            }
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keypress', cardNumberHandlerKeypress, false);

        var cardNumberHandlerChange = function (e) {
            var evt = e || window.event;
            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _selectElementWithHipayId(_idInputMapper['cardNumber']).focus();
            _instanceServiceCreditCard.initCreditCardNumber("");
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardNumberHandlerChange, false);

        _initListenEvent(_idInputMapper[propt]);
    };

    var _initCardHolderFieldEventListener = function() {
        var propt = 'cardHolder';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        var cardHolderHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardHolder(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardHolderHandlerKeydown, false);

        var cardHolderHandlerPaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";

            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');
            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }

            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardHolder("", pastedText);
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardHolderHandlerPaste, false);

        var cardHolderHandlerCut = function (e) {
            setTimeout(function() {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardHolder("");
                _callbackEventFormChange();
            }, 0);
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'cut', cardHolderHandlerCut, false);


        var cardHolderHandlerKeypress = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (evtIsPrintable(evt)) {
                if (!evt.ctrlKey) {
                    evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardHolder(charCode);
                }
            }

            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keypress', cardHolderHandlerKeypress, false);

        var cardHolderHandlerChange = function (e) {
            var evt = e || window.event;

            if (!evt.ctrlKey) {
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }

            _instanceServiceCreditCard = new _serviceCreditCard();
            _selectElementWithHipayId(_idInputMapper['cardHolder']).focus();
            _instanceServiceCreditCard.initCreditCardHolder("");
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardHolderHandlerChange, false);

        _initListenEvent(_idInputMapper[propt]);
    };

    var _initCardExpiryDateFieldEventListener = function() {
        var propt = 'cardExpiryDate';
        if(!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        var cardExpiryDateHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }

            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardExpiryDateHandlerKeydown, false);

        var cardExpiryDateHandlerKeypress = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (charCode == 8 || charCode == 46) {
            } else {
                if (evtIsPrintable(evt)) {
                    if (!evt.ctrlKey) {
                        evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                    }
                    if (charCode >= 48 && charCode <= 57) {
                        _instanceServiceCreditCard = new _serviceCreditCard();
                        _instanceServiceCreditCard.initCreditCardExpiryDate(charCode);
                    }
                }
            }

            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper['cardExpiryDate']), 'keypress', cardExpiryDateHandlerKeypress, false);

        var cardExpiryDateHandlerPaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";

            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');
            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }

            evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardExpiryDate("", pastedText);
            _callbackEventFormChange();

        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardExpiryDateHandlerPaste, false);

        _initListenEvent(_idInputMapper[propt]);
    };

    var _initCVVFieldEventListener = function() {
        var propt = 'cardCVV';
        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        var cardCVVHandlerKeydown = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;

            if (charCode == 8 || charCode == 46) {
                _instanceServiceCreditCard = new _serviceCreditCard();
                _instanceServiceCreditCard.initCreditCardCVV(charCode);
                evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keydown', cardCVVHandlerKeydown, false);

        var cardCVVHandlerKeypress = function (e) {
            var evt = e || window.event;
            var charCode = evt.keyCode || evt.which;
            if (evtIsPrintable(evt)) {
                if (!evt.ctrlKey) {
                    evt.preventDefault ? evt.preventDefault() : evt.returnValue = false;
                }

                if (charCode >= 48 && charCode <= 57) {
                    _instanceServiceCreditCard = new _serviceCreditCard();
                    _instanceServiceCreditCard.initCreditCardCVV(charCode);
                }
            }
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'keypress', cardCVVHandlerKeypress, false);

        var cardCVVHandlerExpiryDatePaste = function (e) {
            var evt = e || window.event;
            var pastedText = "";

            if (window.clipboardData) {
                pastedText = window.clipboardData.getData('Text');
            } else if (evt.clipboardData && evt.clipboardData.getData) {
                pastedText = e.clipboardData.getData('text/plain');
            }

            evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
            _instanceServiceCreditCard = new _serviceCreditCard();
            _instanceServiceCreditCard.initCreditCardCVV("", pastedText);
            _callbackEventFormChange();
        };
        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'paste', cardCVVHandlerExpiryDatePaste, false);

        _initListenEvent(_idInputMapper[propt]);
    }

    var _initCardExpiryMonthFieldEventListener = function() {
        var propt = 'cardExpiryMonth';

        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }

        var cardExpiryMonthHandlerScanExpiry = function (e) {
            var evt = e || window.event;
            if (_selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) != ""
                && _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']) != ""
            ) {
                var expDateFormat = _selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) + ' / ' + _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']).substr(2, 4);
                _instanceServiceCreditCard = new _serviceCreditCard();
                _selectElementWithHipayId(_idInputMapper['cardExpiryDate']).focus();
                _setElementValueWithHipayId(_idInputMapper['cardExpiryDate'], "");
                _instanceServiceCreditCard.initCreditCardExpiryDate("", expDateFormat);
                _setElementValueWithHipayId(_idInputMapper['cardExpiryMonth'], "");
                _setElementValueWithHipayId(_idInputMapper['cardExpiryYear'], "");
                _callbackEventFormChange();
            }
        };

        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardExpiryMonthHandlerScanExpiry, false);

        _initListenEvent(_idInputMapper[propt]);
    }

    var _initCardExpiryYearFieldEventListener = function() {
        var propt = 'cardExpiryYear';

        if (!_elementIsDefined(_idInputMapper[propt])) {
            return;
        }
        var cardExpiryYearHandlerScanExpiry = function (e) {
            var evt = e || window.event;

            if (_selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) != "" && _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']) != "") {
                var expDateFormat = _selectElementValueWithHipayId(_idInputMapper['cardExpiryMonth']) + ' / ' + _selectElementValueWithHipayId(_idInputMapper['cardExpiryYear']).substr(2, 4);
                _instanceServiceCreditCard = new _serviceCreditCard();
                _selectElementWithHipayId(_idInputMapper['cardExpiryDate']).focus();
                _setElementValueWithHipayId(_idInputMapper['cardExpiryDate'], "");
                _instanceServiceCreditCard.initCreditCardExpiryDate("", expDateFormat);
                _setElementValueWithHipayId(_idInputMapper['cardExpiryMonth'], "");
                _setElementValueWithHipayId(_idInputMapper['cardExpiryYear'], "");
                _callbackEventFormChange();
            }
        };

        _addFieldListener(_selectElementWithHipayId(_idInputMapper[propt]), 'change', cardExpiryYearHandlerScanExpiry, false);

        _initListenEvent(_idInputMapper[propt]);
    };

    var _elementIsDefined = function(element) {
        return _selectElementWithHipayId(element) !== null && typeof _selectElementWithHipayId(element) !== "undefined";
    };

    _initApp = function() {

        var my_elem = _selectElementWithHipayId(_idInputMapper.cardNumber);

        if (null != my_elem) {
            var imgType = document.createElement('img');
            imgType.className = 'card-type-custom';
            imgType.setAttribute('data-hipay-id', _idInputMapper['cardType']);
            imgType.src = "";
            imgType.setAttribute('style','display:none;');
            imgType.setAttribute('style','visibility:hidden;');

            my_elem.parentNode.insertBefore(imgType, my_elem.nextSibling);
        }

        var elementPayButton = _selectElementWithHipayId(_idInputMapper.payButton);

        if (null != elementPayButton) {
            var inputCardExpiryMonth = document.createElement('input');
            inputCardExpiryMonth.setAttribute('tabindex', "-1");
            inputCardExpiryMonth.setAttribute('type', "tel");
            inputCardExpiryMonth.setAttribute('style', "position: absolute; left: -999em; width:1px");
            inputCardExpiryMonth.setAttribute('id', "expiration-month");
            inputCardExpiryMonth.setAttribute('data-hipay-id', "card-expiry-month");

            elementPayButton.parentNode.appendChild(inputCardExpiryMonth);

            var inputCardExpiryYear = document.createElement('input');
            inputCardExpiryYear.setAttribute('tabindex', "-1");
            inputCardExpiryYear.setAttribute('type', "tel");
            inputCardExpiryYear.setAttribute('style', "position: absolute; left: -999em; width:1px");
            inputCardExpiryYear.setAttribute('id', "expiration-year");
            inputCardExpiryYear.setAttribute('data-hipay-id', "card-expiry-year");

            elementPayButton.parentNode.appendChild(inputCardExpiryYear);
        }

        _initPlaceholder();
        _initAllFieldsEventListener();
    };

    /* add listener on all input form */
    window.onload = function() {
        if (!Array.prototype.filter) {
            Array.prototype.filter = function(fun /*, thisp */) {
                "use strict";

                if (this === void 0 || this === null) {
                    throw new TypeError();
                }

                var t = Object(this);
                var len = t.length >>> 0;

                if (typeof fun !== "function") {
                    throw new TypeError();
                }

                var res = [];
                var thisp = arguments[1];

                for (var i = 0; i < len; i++) {
                    if (i in t) {
                        var val = t[i]; // in case fun mutates this
                        if (fun.call(thisp, val, i, t)) {
                            res.push(val);
                        }
                    }
                }

                return res;
            };
        }


        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(elt /*, from*/) {
                var len = this.length >>> 0;
                var from = Number(arguments[1]) || 0;

                from = (from < 0)
                    ? Math.ceil(from)
                    : Math.floor(from);
                if (from < 0)
                    from += len;

                for (; from < len; from++) {
                    if (from in this &&
                        this[from] === elt) {
                        return from;
                    }
                }

                return -1;
            };
        }

        if (!document.querySelectorAll) {
            document.querySelectorAll = function (selectors) {
                var style = document.createElement('style'), elements = [], element;
                document.documentElement.firstChild.appendChild(style);
                document._qsa = [];

                style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
                window.scrollBy(0, 0);
                style.parentNode.removeChild(style);

                while (document._qsa.length) {
                    element = document._qsa.shift();
                    element.style.removeAttribute('x-qsa');
                    elements.push(element);
                }
                document._qsa = null;
                return elements;
            };
        }

        if (!document.querySelector) {
            document.querySelector = function (selectors) {
                var elements = document.querySelectorAll(selectors);
                return (elements.length) ? elements[0] : null;
            };
        }

        _initApp();
    };

    /**
     *
     * @return {{card_number, card_expiry_month: string, card_expiry_year: string, card_holder, cvv, multi_use: string, generate_request_id: string}}
     * @private
     */
    var _getParamsFromForm = function() {
        var creditCardExpiryDate = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);
        var month = "";
        var year = "";

        if (creditCardExpiryDate) {
            var explodeExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
            if (explodeExpiryDate.length == 2) {
                month = explodeExpiryDate[0];
                year = explodeExpiryDate[1];
            } else {
                month = explodeExpiryDate[0];
            }
        }

        return  {
            card_number: _selectElementValueWithHipayId(_idInputMapper.cardNumber),
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: _selectElementValueWithHipayId(_idInputMapper.cardHolder),
            cvv: _selectElementValueWithHipayId(_idInputMapper.cardCVV),
            multi_use: "0",
            generate_request_id: "0"
        };
    };


    /**
     * @property {Object} HiPay.CVVInformation
     * @property {String} HiPay.CVVInformation.type
     * @property {Number} HiPay.CVVInformation.length
     */
    HiPay.CVVInformation;

    /**
     * Get CVV information by card (name and length of CVV)
     * @method HiPay.getCVVInformation
     * @return {HiPay.CVVInformation}
     */
    HiPay.getCVVInformation = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();
        var CVVLength = _instanceServiceCreditCard.getCreditCardCVVLengthMax();

        if (typeof CVVLength  == "undefined") {
            CVVLength = 3;
        }

        var idType = _instanceServiceCreditCard.getTypeWithCardNumber(_instanceServiceCreditCard.getCreditCardNumberValue());
        HiPay.CVVInformation = {
            type:_idCVVMapper[idType],
            length: CVVLength
        };

        return  HiPay.CVVInformation;
    }

    /**
     * Get errors in form
     * @method HiPay.Form.paymentFormDataGetErrors
     * @return errorCollection {Array} a collection with entries of type {{#crossLink "_InvalidParametersError"}}{{/crossLink}}.
     */
    HiPay.Form.paymentFormDataGetErrors = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();
        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();
        var params = _getParamsFromForm();
        var errorCollection = {};
        var hasError = false;
        var validatorCreditCardNumber = _instanceServiceCreditCard.validatorCreditCardNumber();
        var creditCardNumberUnformatted = _instanceServiceCreditCard.unformatCreditCardNumber(params['card_number']);

        if (creditCardNumberUnformatted != "") {
            if (!validatorCreditCardNumber.isPotentiallyValid(creditCardNumberUnformatted) ||
                (!validatorCreditCardNumber.isValid(creditCardNumberUnformatted) && _selectElementWithHipayId(_idInputMapper.cardNumber) !== document.activeElement )
            ) {
                errorCollection['cardNumber'] = validatorCreditCardNumber.errorCollection[0]['message'];
            }
        }

        var validatorCreditCardHolder = _instanceServiceCreditCard.validatorCreditCardHolder();
        var creditCardHolderString = params['card_holder'];

        if (typeof creditCardHolderString != 'undefined' && creditCardHolderString != "") {

            if (( validatorCreditCardHolder.isPotentiallyValid(creditCardHolderString) == false) ||
                ( (validatorCreditCardHolder.isValid(creditCardHolderString) == false) && _selectElementWithHipayId(_idInputMapper.cardHolder) && _selectElementWithHipayId(_idInputMapper.cardHolder) !== document.activeElement )
            ) {
                errorCollection['cardHolder'] = validatorCreditCardHolder.errorCollection[0]['message'];
            }
        }

        var validatorCreditCardExpiryDate = _instanceServiceCreditCard.validatorCreditCardExpiryDate();
        var creditCardExpiryDateString = params['card_expiry_month'];

        if (params['card_expiry_year'] != "") {
            creditCardExpiryDateString +=  _separatorMonthYear + params['card_expiry_year'];
        }

        if (creditCardExpiryDateString != "") {
            if (!validatorCreditCardExpiryDate.isPotentiallyValid(creditCardExpiryDateString) ||
                (!validatorCreditCardExpiryDate.isValid(creditCardExpiryDateString) && _selectElementWithHipayId(_idInputMapper['cardExpiryDate']) !== document.activeElement )
            ) {
                errorCollection['cardExpiryDate'] = validatorCreditCardExpiryDate.errorCollection[0]['message'];
            }
        }

        var validatorCreditCardCVV = _instanceServiceCreditCard.validatorCreditCardCVV();
        var creditCardCVVString = params['cvv'];

        if (creditCardCVVString != "") {
            if (!validatorCreditCardCVV.isPotentiallyValid(creditCardCVVString,creditCardNumberUnformatted) ||
                (!validatorCreditCardCVV.isValid(creditCardCVVString) && _selectElementWithHipayId(_idInputMapper['cardCVV']) !== document.activeElement )
            ) {
                if (_selectElementWithHipayId(_idInputMapper['cardCVV'])) {
                    errorCollection['cardCVV'] = validatorCreditCardCVV.errorCollection[0]['message'];
                }
            }
        }

        return errorCollection;
    };

    /**
     * Callback on form change
     * @method HiPay.Form.change
     * @parameter {Function} callback to use when form change
     * @example
     *           HiPay.Form.change(function() {
            // Information on card CVV
            // message CVV
            _selectElementWithHipayId('container-cvv-help-message').innerHTML = HiPay.Form.CVVHelpText();
            // img CVV
            var myImgCVV = _selectElementWithHipayId("cvv-img");
            var cvvInfo = HiPay.getCVVInformation();
            myImgCVV.src = "./img/cvv-type/cvv_"+cvvInfo['length']+".png";

            $("#pay-button").prop('disabled', !HiPay.Form.paymentFormDataIsValid());
            var errorCollection = HiPay.Form.paymentFormDataGetErrors();
        });
     *
     */
    HiPay.Form.change = function(callback) {
        _callbackEventFormChange = callback;
    };

    /**
     * Is valid form data.
     * @method HiPay.Form.paymentFormDataIsValid
     * @return {Boolean} Form is or is not valid
     *
     */
    HiPay.Form.paymentFormDataIsValid = function() {
        var params = {
            card_number: _selectElementValueWithHipayId(_idInputMapper["cardNumber"]),
            card_holder: _selectElementValueWithHipayId(_idInputMapper["cardHolder"]),
            cvc: _selectElementValueWithHipayId(_idInputMapper["cardCVV"]),
            card_expiry_date:_selectElementValueWithHipayId(_idInputMapper["cardExpiryDate"]),
            multi_use: "0"
        };

        if (!_instanceServiceCreditCard) {
            _instanceServiceCreditCard = new _serviceCreditCard();
        }

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        return validatorCreditCard.isValid(params);
    };

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
                    value = typeof specialValueCallback !== "undefined" ? (specialValueCallback(key, payload[key]) || payload[key]) : payload[key];

                    if (!_canDefineProperty || mapping.propertyDescriptors.writable) {
                        instance[mapping.name] = value;
                    } else {
                        propertyConfig[mapping.name] =_extend({}, mapping.propertyDescriptors, {
                            value: value,
                            configurable: true
                        });
                    }
                }
            }
        }

        if (_canDefineProperty) {
            Object.defineProperties(instance, propertyConfig);
        }
    };

    if (Object.defineProperty && isIE() < 10 && (! 'classList' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'classList', {
            get: function () {
                var self = this, bValue = self.className.split(" ");

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
                };
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
            }
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
    };

    /**
     * @param responseJSON
     * @constructor
     */
    HiPay.Token = function (responseJSON) {
        var payload;

        if (typeof responseJSON !== "undefined") {
            payload = responseJSON;
        }
        if (typeof responseJSON.data !== "undefined") {
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
    };

    /**
     *
     * @param context
     * @param payload
     * @return {*}
     */
    HiPay.Token.populateProperties = function (context, payload) {
        _processObjectPayload(context, payload,  function (key, val){
        });
        return context;
    };

    /**
     * Set environment type (stage or production) to make HiPay API calls in stage or production environment.
     *
     * @method HiPay.setTarget
     * @param target
     */
    HiPay.setTarget = function(target) {
        HiPay.target = target;
        _initListPaymentMethod();
    };

    /**
     * Get environment type (stage or production) to make API calls in stage or production.
     *
     * @method HiPay.getTarget
     * @return string HiPay.target (stage or production)
     */
    HiPay.getTarget = function() {
        return HiPay.target;
    };

    /**
     * Set credentials (username and password of your public HiPay Api credentials). Use only HiPay credentials with public accessibility.
     *
     * @method HiPay.setCredentials
     * @param username
     * @param password
     */
    HiPay.setCredentials = function(username, password) {
        HiPay.username = username;
        HiPay.password = password;

        _initListPaymentMethod();
    };

    var _availablePaymentProductsCustomerCountry = "";
    var _availablePaymentProductsCurrency = "";
    var _customPaymentProducts = [];
    var _availablePaymentProductsCollection = [];
    var _availableAndEnabledPaymentProductsCollection = [];

    /**
     * ISO 3166-1 alpha-2 country code
     *
     * @method  HiPay.setAvailalblePaymentProductsCustomerCountry
     * @param {String} countryISO2
     */
    HiPay.setAvailalblePaymentProductsCustomerCountry = function(countryISO2) {
        _availablePaymentProductsCustomerCountry = countryISO2;
        _initListPaymentMethod();
    };

    /**
     * ISO 4217 currency code
     *
     * @method HiPay.setAvailalblePaymentProductsCurrency
     * @param {String} currencyISO4217
     */
    HiPay.setAvailalblePaymentProductsCurrency = function(currencyISO4217) {
        _availablePaymentProductsCurrency = currencyISO4217;
        _initListPaymentMethod();
    };

    /**
     * Payment products list enabled in the payment form. If a payment product is not enabled in your HiPay account, it will be ignore.
     * visa, mastercard, diners, american-express, maestro
     *
     * @method HiPay.enabledPaymentProducts
     * @param {Array} collectionPaymentProducts
     * @example
     *      HiPay.enabledPaymentProducts(['visa', 'maestro']);
     */
    HiPay.enabledPaymentProducts = function(collectionPaymentProducts) {
        _customPaymentProducts = collectionPaymentProducts;
        _initListPaymentMethod();
    };


    function _disableAllInput() {
        for (var propt in _idInputMapper) {
            _selectElementWithHipayId(_idInputMapper[propt]).disabled = true;
        }
    }

    function _enableAllInput() {
        for (var propt in _idInputMapper) {
            _selectElementWithHipayId(_idInputMapper[propt]).disabled = false;
        }
    }

    /**
     *
     * @param endpoint
     * @param requestParams
     * @param returnPromise
     * @param checkKey
     * @return {Promise|HiPay.Token} A promise of the result that returns a HiPay.Token in case of success
     * @private
     */
    var _performAPICall = function (endpoint, requestParams, returnPromise, checkKey) {
        if ((typeof checkKey === 'undefined' || checkKey) && (typeof HiPay.password === 'undefined' || typeof HiPay.username === 'undefined')) {
            throw new _Error('missing_public_key', 'You have to provide a HiPay username and public key in order to perform API calls.');
        }

        try{
            var authEncoded = window.btoa(HiPay.username + ':' + HiPay.password);
        } catch(e) {
            throw new _Error('missing_public_key');
        }

        // Ne fonctionne pas avec IE 10 ?
        if ('XDomainRequest' in window && window.XDomainRequest !== null && isIE() != 10 && isIE() != 9) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.password);
        }

        var config = {
            headers: {
                'Authorization': "Basic " + authEncoded,
                'Content-Type': "application/json"
            }
        };

        function _status(response) {

            if (response.status >= 200 && response.status < 300) {
                return response
            }
            throw new Error(response.statusText)
        }

        function _json(response) {
            return response.json()
        }

        return new Promise(function (resolve, reject) {

            fetch(endpoint, {
                method: "POST",
                headers: config['headers'],
                body: JSON.stringify( requestParams )
            })
                .then(function (response) {

                    // alert(response);
                    return response.json();
                })
                .then(function (result) {

                    if( typeof result['code'] != "undefined" )  {
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
                        method: "POST",
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
        var _listEnabledPaymentProducts = [];
        _availableAndEnabledPaymentProductsCollection = [];

        if (_availablePaymentProductsCollection.length > 0) {
            if (_customPaymentProducts.length > 0) {
                for (productAvailableIndex in _availablePaymentProductsCollection) {
                    for (productCustomIndex in _customPaymentProducts) {
                        if (_customPaymentProducts[productCustomIndex] == _availablePaymentProductsCollection[productAvailableIndex]['code']) {
                            _availableAndEnabledPaymentProductsCollection.push(_availablePaymentProductsCollection[productAvailableIndex]['code']);
                        }
                    }
                }
            } else {
                for (productAvailableIndex in _availablePaymentProductsCollection) {
                    _availableAndEnabledPaymentProductsCollection.push(_availablePaymentProductsCollection[productAvailableIndex]['code']);
                }
            }
        }
    };

    var _getAvailablePaymentProducts = function() {
        if (!HiPay.getTarget() || !HiPay.username || !HiPay.password || !_availablePaymentProductsCustomerCountry || !_availablePaymentProductsCurrency) {
            return;
        }

        var endpoint = _endPointAvailablePaymentProducts['prod'];
        if (HiPay.getTarget() == 'test' || HiPay.getTarget() == 'stage' ) {
            endpoint = _endPointAvailablePaymentProducts['stage'];
        } else if (HiPay.getTarget() == 'dev') {
            endpoint = 'http://localhost:8080/example/dev-api-token.php';
        }

        var endpoint2 = endpoint + "?eci=7&customer_country="+_availablePaymentProductsCustomerCountry+"&currency=" + _availablePaymentProductsCurrency;
        var requestParams = {
            'eci': 7,
            'customer_country': _availablePaymentProductsCustomerCountry,
            'currency': _availablePaymentProductsCurrency
        };

        if ('XDomainRequest' in window && window.XDomainRequest !== null && isIE() != 10) {
            requestParams['Authorization'] = 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.password);
        }

        try {
            var authEncoded = window.btoa(HiPay.username+':'+HiPay.password);
        } catch(e) {
            throw new _Error('missing_public_key');
        }

        var config = {
            headers: {
                'Authorization': "Basic " + authEncoded,
                'Accept': "application/json"
            }
        };

        _loadPaymentProduct = true;

        var mypromise = fetch(endpoint, {
            method: "GET",
            headers: config['headers'],
            data: JSON.stringify( requestParams )
        });

        mypromise.then(function (response) {
            return response.json();
        }).then(function (availablePaymentProductsCollection) {
            _availablePaymentProductsCollection = availablePaymentProductsCollection;
            _loadPaymentProduct = false;
        });

        mypromise["catch"](function (error) {
            _loadPaymentProduct = false;
            reject(new _APIError(error));

        });
    };

    var _initListPaymentMethod = function() {
        _getAvailablePaymentProducts();
    };

    var _extend = function () {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;

        if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
            deep = arguments[0];
            i++;
        }

        var merge = function (obj) {
            for (var prop in obj ) {
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

        for ( ; i < length; i++ ) {
            var obj = arguments[i];
            merge(obj);
        }

        return extended;
    };


    /**
     *
     * @param data
     * @private
     */
    var _APIError = function (data) {

        var payload;

        if (typeof data.response.data !== "undefined") {
            payload = data.response.data;
        }

        if (typeof payload === 'object') {
            _processObjectPayload(this, _extend({}, payload, {
                'code': payload.code,
                'message': payload.message,
                'description': payload.description
            }));
        } else {
            _processObjectPayload(this, _extend({}, payload, {
                'code': "code",
                'message': "other",
                'description': "description"
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
    function _InvalidParametersError(code, message)
    {
        _processObjectPayload(this, {
            'type': 'invalid_parameters',
            'code': code,
            'message': message
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
            'type': 'invalid_cc_form',
            'errorCollection': errorCollection
        });
    };

    _InvalidFormTokenizationError.prototype = new _Error();

    /**
     * @property {Object} HiPay.Token
     * @property {String} HiPay.CVVInformation.token
     * @property {Number} HiPay.CVVInformation.requestId
     * @property {String} HiPay.CVVInformation.brand
     * @property {String} HiPay.CVVInformation.pan
     * @property {String} HiPay.CVVInformation.cardHolder
     * @property {Number} HiPay.CVVInformation.cardExpiryMonth
     * @property {Number} HiPay.CVVInformation.cardExpiryYear
     * @property {String} HiPay.CVVInformation.issuer
     * @property {String} HiPay.CVVInformation.country
     * @property {String} HiPay.CVVInformation.cardType
     */
    _defineProperties(HiPay.Token, {
        'token': {name: 'token'},
        'requestId': {name: 'request_id'},
        'brand': {name: 'brand'},
        'pan': {name: 'pan'},
        'cardHolder': {name: 'card_holder'},
        'cardExpiryMonth': {name: 'card_expiry_month'},
        'cardExpiryYear': {name: 'card_expiry_year'},
        'issuer': {name: 'issuer'},
        'country': {name: 'country'},
        'cardType': {name: 'card_type'}
    });

    _defineProperties(_APIError, {
        'code': {name: 'code'},
        'message': {name: 'message'}
    });

    _defineProperties(_InvalidParametersError, {
        'code': {name: 'code'},
        'message': {name: 'message'},
        'server_response': {name: 'serverResponse'}
    });

    _defineProperties(_InvalidFormTokenizationError, {
        'code': {name: 'code'},
        'message': {name: 'message'},
        'errorCollection': {name: 'errorCollection'},
        'server_response': {name: 'serverResponse'}
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
     * @return {Promise}
     *
     */
    HiPay.tokenize = function(cardNumber, expiryMonth, expiryYear, cardHolder, cvv, multiUse, generateRequestId) {

        var params = {
            'card_expiry_month': expiryMonth,
            'card_expiry_year': expiryYear,
            'card_number': cardNumber,
            'card_holder': cardHolder,
            'cvc': cvv,
            'multi_use': multiUse,
            'generate_request_id': generateRequestId
        };

        var returnPromise =  new Promise(function (resolve, reject) {});
        if (!_isBrowser()) {
            return returnPromise.reject(new _APIError('"message" : "cant tokenize on server side"}'));
        }

        if (params['card_expiry_month'].length < 2) {
            params['card_expiry_month'] = '0' + params['card_expiry_month'];
        }
        if (params['card_expiry_year'].length == 2) {
            params['card_expiry_year']  = '20' +  params['card_expiry_year'];
        }

        var validatorCreditCard = _instanceServiceCreditCard.validatorCreditCard();

        if (validatorCreditCard.isValid(params) === false) {
            var errorCollection = validatorCreditCard.errorCollection;
            var customError = new _InvalidFormTokenizationError(errorCollection);
            customError.errorCollection = errorCollection;
            return Promise.reject(customError);
        } else {
            var endpoint = _endPointTokenize['production'];
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
     * @return {String} CVV information text
     */
    HiPay.Form.CVVHelpText = function() {
        var serviceCreditCard = new _serviceCreditCard();
        var CVVLength = serviceCreditCard.getCreditCardCVVLengthMax();

        if (typeof CVVLength == "undefined") {
            CVVLength = 3;
        }

        return _translationJSON[HiPay.Form.locale]["FORM_CVV_"+CVVLength+"_HELP_MESSAGE"];
    };

    /**
     * Tokenize form data.
     * @method HiPay.Form.tokenizePaymentFormData
     * @return {Promise|HiPay.Token} A promise of the result that returns a HiPay.Token in case of success
     */
    HiPay.Form.tokenizePaymentFormData = function() {

        if (!HiPay.Form.paymentFormDataIsValid()) {
            return false;
        }

        var creditCardExpiryDate = _selectElementValueWithHipayId(_idInputMapper['cardExpiryDate']);
        var explodeExpiryDate = creditCardExpiryDate.split(_separatorMonthYear);
        var month = explodeExpiryDate[0];
        var year = "20"+explodeExpiryDate[1];
        var params = {
            card_number: _selectElementValueWithHipayId(_idInputMapper.cardNumber),
            card_expiry_month: month,
            card_expiry_year: year,
            card_holder: _selectElementValueWithHipayId(_idInputMapper.cardHolder),
            cvv: _selectElementValueWithHipayId(_idInputMapper.cardCVV),
            multi_use: '0',
            generate_request_id: '0'
        };

        return HiPay.tokenize(params['card_number'], params['card_expiry_month'], params['card_expiry_year'], params['card_holder'], params['cvv'], params['multi_use'], params['generate_request_id'] )
    };

    /**
     * Get card type
     * @method HiPay.Form.getCardType
     * @return {String} Payment product name
     */
    HiPay.Form.getCardType = function() {
        _instanceServiceCreditCard = new _serviceCreditCard();
        var cardTypeId = _instanceServiceCreditCard.getCardTypeId();

        for (var product in _idProductAPIMapper) {
            if (cardTypeId === _idProductAPIMapper[product]) {
                return product;
            }
        }

        return undefined;
    };

    /**
     * Set CVV max length
     * @method HiPay.Form.setCreditCardCVVMaxLength
     * @param {Number} cardCVVMaxLength
     * @return {void}
     */
    HiPay.Form.setCreditCardCVVMaxLength = function(cardCVVMaxLength) {
        _instanceServiceCreditCard = new _serviceCreditCard();
        _instanceServiceCreditCard.setCreditCardCVVMaxLength(cardCVVMaxLength);
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initListeners
     * @return {void}
     */
    HiPay.Form.initListeners = function() {
        _initAllFieldsEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardHolderListeners
     * @return {void}
     */
    HiPay.Form.initCardHolderListeners = function () {
        _initCardHolderFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardExpiryDateListeners
     * @return {void}
     */
    HiPay.Form.initCardExpiryDateListeners = function() {
        _initCardExpiryDateFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCVVListeners
     * @return {void}
     */
    HiPay.Form.initCVVListeners = function() {
        _initCVVFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardExpiryMonthListeners
     * @return {void}
     */
    HiPay.Form.initCardExpiryMonthListeners = function() {
        _initCardExpiryMonthFieldEventListener();
    };

    /**
     * Init listeners on input
     * @method  HiPay.Form.initCardExpiryYearListeners
     * @return {void}
     */
    HiPay.Form.initCardExpiryYearListeners = function() {
        _initCardExpiryYearFieldEventListener();
    };

    /**
     * Get id element with field
     * @method  HiPay.Form.getMappedField
     * @return {void}
     */
    HiPay.getMappedField = function(field) {
        return _idInputMapper[field];
    };

    return HiPay;

} (HiPay || {}));