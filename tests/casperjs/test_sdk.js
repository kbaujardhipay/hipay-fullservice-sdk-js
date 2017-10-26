/**
 * Created by jkurc on 12/06/17.
 */

var vendorPagePath = 'http://localhost/vendor-page/test3ds';

var lastPostedData;

var listener = function(resource, request) {
    if (!lastPostedData && "postData" in resource) {
        lastPostedData = resource.postData;
    }
};

casper.on("resource.requested", listener);
/* log console.info in casper test */
casper.on('remote.message', function(message) {
    this.echo(message);
});

// casper.options.clientScripts.push("hipay-smart-3ds.js");

if(!casper.cli.get('type')) {
    casper.options.clientScripts.push("src/hipay-fullservice-sdk.js");
} else if(casper.cli.get('type') == "min") {
    casper.options.clientScripts.push("dist/hipay-fullservice-sdk.min.js");
}

// casper.options.verbose      = true;
// casper.options.logLevel     = "debug";

// casper.test.begin('TEST 1', 1, function suite(test) {
//     casper.start(vendorPagePath + "/bank-sms.html", function() {
//         //casper.start("http://web/bank-ok.html", function() {
//         //test.assertTitle("3DS verification", "Titre OK");
//
//         test.assertEvalEquals(
//             function() {
//                 try
//                 {
//                     return HiPay3DS.doAction(null);
//                     // var filePath = 'http://web/bank/ing/sms.txt';
//                     // xmlhttp = new XMLHttpRequest();
//                     // xmlhttp.open("GET",filePath,false);
//                     // xmlhttp.send(null);
//                     // var fileContent = xmlhttp.responseText;
//
//                     //return HiPay3DS.doAction(JSON.stringify({"transaction_amount": "12.56", "SMS": "code 123456 montant de 12,56€"}));
//                     // return HiPay3DS.doAction(JSON.stringify({"transaction_amount": "0.1", "SMS": non}));
//                 } catch (e)
//                 {
//                     return ("message" in e) ? e.message : e;
//                 }
//             },
//             // JSON.stringify({ "status": "CODE_SENT", "sent_code": "11111"  }),
//             JSON.stringify(
//                 {
//                     // "url": "myurl",
//                     "data": {
//                         // "transaction" : {},
//                         "input" : null,
//                         "output" : {
//                             "status": "CODE_SENT", "sent_code": "11111", "check_loading": "500"
//                         },
//                     }
//                 }
//                 ),
//
//             // 'doAction(null) returns ' + JSON.stringify({ "status": "CODE_SENT" , "sent_code": "11111" })
//             'doAction(null) returns ' + JSON.stringify({
//                 // "url": "myurl",
//                 "data": {
//                     "transaction" : {},
//                     "input" : {},
//                     "output" : {
//                         "status": "CODE_SENT", "sent_code": "11111",
//                         "check_loading": "500"
//                     },
//                 }
//             })
//         );
//     });
//
//     casper.run(function() {
//         test.done();
//     });
// });