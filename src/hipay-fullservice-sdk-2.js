/**
 * HiPay Fullservice library
 */

var HiPay = (function (HiPay) {
    var Hipay = {};

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
             *    Hipay.target = "stage";
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
        HipayPrivate.target = 'production';
    }

    // Define property helper
    var _defineProperties = function(object, properties) {
        // console.log("properties");
        // console.log(properties);

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


    var ValidatorCC = function (errorCollection) {
        var validatorCC = {};

        validatorCC.errorCollection = errorCollection || [];


        validatorCC.isValid = function(value) {

            return _isCardNumberValid(value);
        }

        var _isCardNumberValid = function (value) {
            if (/[^0-9-\s]+/.test(value)) return false;
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

        var validatorCC = new ValidatorCC(errorCollection);
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

    Hipay.Token = function (responseJSON) {


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


    // Hipay.Token.prototype = {
    //     hydrate : function(responseJson) {
    //
    //         if (responseJson.data) {
    //
    //         }
    //         console.log("responseJson.data");
    //         console.log(responseJson.data);
    //     }
    //
    // }

    Hipay.Token = function() {
        _bootstrapInstanceProperties(this);
    }

    Hipay.Token.populateProperties = function (context, payload) {


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

        if ((typeof checkKey === 'undefined' || checkKey) && (typeof HiPay.publicKey === 'undefined' || typeof HiPay.username === 'undefined')) {
            throw new _Error('missing_public_key', 'You have to provide a HiPay username and public key in order to perform API calls.');
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

        // dump(window.btoa(HiPay.username + ':' + HiPay.publicKey));

        // reqwest({
        //     url: endpoint,
        //     withCredentials: true,
        //     crossOrigin: true,
        //     method: 'post',
        //     // contentType: 'application/json',
        //     headers: {
        //         'Authorization': 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey)
        //     },
        //     data: requestParams,
        //     success: function(resp) {
        //
        //         if( typeof resp['code'] != 'undefined' )  {
        //             fn_failure({ code: resp['code'], message: resp['message'] });
        //         }  else {
        //             fn_success(resp);
        //         }
        //     },
        //     error: function (err) {
        //         obj = JSON.parse(err['response']);
        //         fn_failure({ code: obj['code'], message: obj['message'] });
        //     }
        // });









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


        axios.post(endpoint,requestParams,config)
            .then(function(responseJson) {
                // console.log(responseJson);

                if( typeof responseJson['code'] != 'undefined' )  {


                    returnPromise.reject(new _APIError(responseJson));
                    return returnPromise;
                    // throw new Error(responseJson);
                }
                else {

                    var cardToken = new Hipay.Token(responseJson);
                    // console.log("Hipay.cardToken");
                    cardToken.constructor.populateProperties(cardToken, responseJson.data);
                    // console.log("Hipay.cardToken");
                    // console.log(Hipay.cardToken);

                    // Hipay.cardToken.hydrate(responseJson);

                    returnPromise.resolve(cardToken);
                    return returnPromise;

                }
            }).catch(function (error) {


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


                return Promise.reject(new _APIError(error));
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

        if (typeof data.responseJSON !== 'undefined') {
            payload = data.responseJSON;
        }

        if (typeof payload === 'object') {
            _processObjectPayload(this, $.extend({}, payload, {
                description: 'An API error occurred. Check the message parameter for more details.',
                type: 'api'
            }));
        } else {
            _processObjectPayload(this, $.extend({}, payload, {
                message: 'other',
                description: 'An error occurred while sending the request.',
                server_response: payload,
                type: 'api'
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
            // description: description
        });
    };

    _InvalidParametersError.prototype = new _Error();

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


    _defineProperties(Hipay.Token, {

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
         * @property details
         * @type Object
         * @final
         */

        details: {name: 'details'},

        /**
         * The server response body.
         *
         * @property serverResponse
         * @type string
         * @final
         */

        server_response: {name: 'serverResponse'}
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


    /**
     *
     * @param params
     * @returns {*}
     */



    // Hipay.Promise = function(promise) {
    //     var publicPromise = {};
    //
    //
    //
    //     publicPromise.done = promise.prototype.done;
    //     publicPromise.fail = promise.prototype.catch;
    //     return publicPromise;
    // }


    HiPay.tokenize = function(params) {
        var returnPromise = Promise;
        // returnPromise.done = returnPromise.prototype.done;
         // return fail = function( ) {
            //     alert('toto');
            // };
        // tests if global scope is binded to window
        if(_isBrowser()) {

// dump(Hipay.promise);
            returnPromise.reject({"message" : "cant tokenize on server side"});

            return returnPromise;




        }

        if(params['card_expiry_month'].length < 2) {
            params['card_expiry_month'] = '0' + params['card_expiry_month'];
        }
        if(params['card_expiry_year'].length == 2) {
            params['card_expiry_year'] = '20' + params['card_expiry_year'];
        }
        var errorCollection = _isValidCCForm(params);

        if (errorCollection.length > 0) {
            var customError = new Error('Form error');
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


            if (!("generate_request_id" in params)) {
                params['generate_request_id'] = 0;
            }


            var config = {
                headers: {'Authorization': 'Basic ' + window.btoa(HiPay.username + ':' + HiPay.publicKey)}
            };


            return _performAPICall(endpoint, params, returnPromise);
        }


    };

    return HiPay;

} (HiPay || {}));