//Will instantiate on every tab we enter
console.log("Ready to go...");

var wwwAuthToken = "";
var clientSecretKey = "";

//Fetch Loginext API Tokens
//Get User Access Token
chrome.storage.sync.get(["Authenticate"], function(items) {
  console.log("Authenticate key");
  if (typeof items.Authenticate === "undefined") {
    alert("Please Login to Loginext by clicking Loginext icon on top right");
  } else {
    wwwAuthToken = items.Authenticate;
  }
  //console.log (items.Authenticate);
  //console.log(items);
});

//Get Clent Secret Key
chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
  console.log("Client key");
  clientSecretKey = items.CLIENT_SECRET_KEY;
  console.log(items.CLIENT_SECRET_KEY);
  console.log(items);
});


chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  console.log(message.messageString);
}

//Loginext  - //Load XPath
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

var ClientSecretKey = "";
$(document).bind('keypress', function(event) {

  //When 'Shift + L' is pressed - Call Loginext Load Order
  if (event.shiftKey && event.which === 76) { //Ascii code for 'L'

    //alert('Loaded :)');
    loadOrder();
  }
});

/**
 * Will load order from OQM to Loginext
 */
function loadOrder() {
  try {
    //Ask user to login if token is not setAttribute
    //Fetch Loginext API Tokens

    //Get User Access Token
    chrome.storage.sync.get(["Authenticate"], function(items) {
      console.log("Authenticate key");
      if (typeof items.Authenticate === "undefined") {
        alert("Please Login to Loginext by clicking Loginext icon on top right to process data");
      }
      //console.log (items.Authenticate);
      //console.log(items);
    });

    //Get Clent Secret Key
    chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
      console.log("Client key");
      clientSecretKey = items.CLIENT_SECRET_KEY;
      console.log(items.CLIENT_SECRET_KEY);
      console.log(items);
    });


    //Add Order to Q
    var orderElement = getElementByXpath("//*[@class='orderDataTitle']//span[1]");
    //console.log("Fetched order : "+ orderElement);
    var orderNumber = orderElement.innerHTML;
    console.log("Fetched order : " + orderNumber);
    orderNumber = orderNumber.replace(new RegExp("-", 'g'), "_");
    orderNumber = orderNumber.replace(new RegExp("/", 'g'), "_");
    console.log("Fetched order : " + orderNumber);

    //Fetch its lat long co-ords
    var latLongs = getElementByXpath("//*[text()='Latitude / Longitude']//ancestor::tr[1]//td[@class='orderData2']//span"); // - //*[text()='Latitude / Longitude']//ancestor::tr[1]//td[@class="orderData2"]//span
    //console.log("Fetched latLongs : "+ latLongs);
    var latLongs = latLongs.innerHTML;
    var latLongs_array = latLongs.split(" ");
    console.log("Fetched lat longs : lat = " + latLongs_array[0] + " long : " + latLongs_array[1]);

    //Get Customer Name - //Get Customer Name - //*[text()='Customer']//ancestor::tr[1]//td[@class="orderData4"]//span[1]
    var custName = getElementByXpath("//*[text()='Customer']//ancestor::tr[1]//td[@class='orderData4']//span[1]");
    var custText = custName.innerText;
    console.log("Fetched Customer Name : " + custText);

    //Fetch Customer Address
    var address = getElementByXpath("//*[text()='Address']//ancestor::tr[1]//td[@class='orderData2']//span"); // - //*[text()='Address']//ancestor::tr[1]//td[@class=\"orderData2\"]
    //console.log ("Fetch address : "+ address);
    var addressText = address.innerHTML;
    console.log("Fetched addressText : " + addressText);

    //Get Total after rounding - //*[text()='Total After Rounding']//ancestor::tr[1]//td[@class='orderItemsTotal5']//span
    var totalAfterRoundingElem = getElementByXpath("//*[text()='Total After Rounding']//ancestor::tr[1]//td[@class='orderItemsTotal5']//span");
    var totalAfterRoundingText = totalAfterRoundingElem.innerText;
    console.log("Fetched total after rounding : " + totalAfterRoundingText);

    //Get Branch  - //*[@class='mcdeliveryLogo']//ancestor::tr[1]//td[@valign="middle"]//span[1]
    var branchElem = getElementByXpath("//*[@class='mcdeliveryLogo']//ancestor::tr[1]//td[@valign='middle']//span[1]"); // //*[@class='mcdeliveryLogo']//ancestor::tr[1]//td[@valign="middle"]//span[1]
    var branchText = branchElem.innerText;
    console.log("Branch : " + branchText);

    var phoneNumberElem = getElementByXpath("//*[text()='Phone No']//ancestor::tr[1]//td[@class='orderData2']//span[1]"); //  // - //*[text()='Phone No']//ancestor::tr[1]//td[@class='orderData2']//span
    var phoneNumberText = phoneNumberElem.innerText;
    console.log('Phone number : ' + phoneNumberText);

    //Fetch Loginext API Tokens
    //Get User Access Token
    chrome.storage.sync.get(["Authenticate"], function(items) {
      console.log("Authenticate key");
      if (typeof items.Authenticate === "undefined") {
        alert("Please Login to Loginext by clicking Loginext icon on top right");
      } else {
        wwwAuthToken = items.Authenticate;
      }
      //console.log (items.Authenticate);
      //console.log(items);
    });

    //Get Clent Secret Key
    chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
      console.log("Client key");
      clientSecretKey = items.CLIENT_SECRET_KEY;
      console.log(items.CLIENT_SECRET_KEY);
      console.log(items);
    });

    //McD Order Invoice should have a hidden element of id = __VIEWSTATEGENERATOR
    if (document.getElementById("__VIEWSTATEGENERATOR") == null) {
      alert("Unknown Page, please refer Invoice page to process data");
      return;
    }

    if (document.getElementById('messageText') == null) {

      //Setting a message box on web page
      var para = document.createElement("h3");
      var t = document.createTextNode("Loginext - Loading... Please wait");
      para.appendChild(t);

      //Set attributes for further logging
      para.setAttribute("align", "center");
      para.setAttribute("id", "messageText");
      para.setAttribute("name", "messageText");

      var br = document.createElement("br");

      //document.body.appendChild(para); //document.body.appendChild(para);
      document.getElementById("__VIEWSTATEGENERATOR").parentNode.appendChild(para);
      document.getElementById("__VIEWSTATEGENERATOR").parentNode.appendChild(br);
      document.getElementById("__VIEWSTATEGENERATOR").parentNode.appendChild(br);

    } else {
      log("Reload...");
    }

    console.log("Auth Tokens : " + wwwAuthToken + "," + clientSecretKey);

    //Call Loginext OD
    $.ajax({
      url: "https://products.loginextsolutions.com/ShipmentApp/ondemand/v1/create",
      type: 'post',
      contentType: "application/json",
      data: JSON.stringify(
        [{
          "cashOnDelivery": totalAfterRoundingText,
          "customerName": custText,
          "locality": "Test",
          "subLocality": "test 1",
          "address": addressText,
          "deliverPhoneNumber": "60166788040",
          "orderNo": orderNumber,
          "distributionCenter": "McDonald's Malaysia",
          "paymentType": "COD"
        }]

      ),
      headers: {
        "WWW-Authenticate": wwwAuthToken,
        "CLIENT_SECRET_KEY": clientSecretKey, //'key', //If your header name has spaces or any other char not appropriate
        "Content-Type": 'application/json' //for object property name, use quoted notation shown in second
      },
      dataType: 'json',
      beforeSend: function() {
        //log ("Loading...");
      },
      success: function(data) {
        try {
          if (data.status === 200 && data.message === "Success") {
            log("Added order " + orderNumber + " in Loginext");
          } else {
            log(data.status + " : " + data.message);
          }
        } catch (err) {
          log("Error in parsing response output.");
        }
        //console.info(data);
      },
      error: function(xhr) {
        log("An error occured: " + xhr.status + " " + xhr.statusText);
      }
    });


  } catch (err) {
    alert("Unknown page please refer Order Invoice Page to process data...");
    console.log("Current page is not order invoice ");
    log("Unknown page...");
  }

}

function log(logMessage) {
  //If the message window for McD is not set - Log it in Console
  if (document.getElementById('messageText') == null) {
    console.log("Log - " + logMessage);
  } else {
    //Log it in the context of McD OQM Web Page
    document.getElementById('messageText').innerText = logMessage;
  }

}

/*
$(document).keyup(function(e) {

    try
    {
          //Add Order to Q
          if (e.key === 'q' || e.key === 'Q' || e.keyCode == 27) {

            var orderElement = getElementByXpath ("//*[@class='orderDataTitle']//span[1]");
            //console.log("Fetched order : "+ orderElement);
            var orderNumber = orderElement.innerHTML;
            console.log("Fetched order : "+orderNumber);
            orderNumber =  orderNumber.replace(new RegExp("-", 'g'), "_");
            orderNumber =  orderNumber.replace(new RegExp("/", 'g'), "_");
            console.log("Fetched order : "+orderNumber);

            //Fetch its lat long co-ords
            var latLongs = getElementByXpath("//*[text()='Latitude / Longitude']//ancestor::tr[1]//td[@class='orderData2']//span"); // - //*[text()='Latitude / Longitude']//ancestor::tr[1]//td[@class="orderData2"]//span
            //console.log("Fetched latLongs : "+ latLongs);
            var latLongs =  latLongs.innerHTML;
            var latLongs_array = latLongs.split(" ");
            console.log("Fetched lat longs : lat = "+latLongs_array[0] + " long : "+latLongs_array[1]);

            //Get Customer Name - //Get Customer Name - //*[text()='Customer']//ancestor::tr[1]//td[@class="orderData4"]//span[1]
            var custName = getElementByXpath("//*[text()='Customer']//ancestor::tr[1]//td[@class='orderData4']//span[1]");
            var custText = custName.innerText;
            console.log("Fetched Customer Name : "+  custText);

            //Fetch Customer Address
            var address = getElementByXpath("//*[text()='Address']//ancestor::tr[1]//td[@class='orderData2']//span");  // - //*[text()='Address']//ancestor::tr[1]//td[@class=\"orderData2\"]
            //console.log ("Fetch address : "+ address);
            var addressText = address.innerHTML;
            console.log("Fetched addressText : "+  addressText);

            //Get Total after rounding - //*[text()='Total After Rounding']//ancestor::tr[1]//td[@class='orderItemsTotal5']//span
            var totalAfterRoundingElem = getElementByXpath("//*[text()='Total After Rounding']//ancestor::tr[1]//td[@class='orderItemsTotal5']//span");
            var totalAfterRoundingText = totalAfterRoundingElem.innerText;
            console.log("Fetched total after rounding : "+ totalAfterRoundingText);

            //Get Branch  - //*[@class='mcdeliveryLogo']//ancestor::tr[1]//td[@valign="middle"]//span[1]
            var branchElem = getElementByXpath("//*[@class='mcdeliveryLogo']//ancestor::tr[1]//td[@valign='middle']//span[1]");// //*[@class='mcdeliveryLogo']//ancestor::tr[1]//td[@valign="middle"]//span[1]
            var branchText =  branchElem.innerText;
            console.log("Branch : "+ branchText);

            var phoneNumberElem = getElementByXpath("//*[text()='Phone No']//ancestor::tr[1]//td[@class='orderData2']//span[1]");//  // - //*[text()='Phone No']//ancestor::tr[1]//td[@class='orderData2']//span
            var phoneNumberText  = phoneNumberElem.innerText;
            console.log('Phone number : '+ phoneNumberText);

            //TODO - Connect to Firebase and get corresponding branch username password strings


            //Call Loginext OD
            $.ajax({
              url: "https://products.loginextsolutions.com/ShipmentApp/ondemand/v1/create",
              type: 'post',
              contentType: "application/json",
              data:
              JSON.stringify(
                  [ {
                    "cashOnDelivery": totalAfterRoundingText,
                    "customerName": custText,
                    "locality": "Powai",
                    "subLocality": "Supreme Business Park",
                    "address": addressText,
                    "deliverPhoneNumber": "8888889999",
                    "orderNo": orderNumber,
                    "distributionCenter": "OnDemandDemoBranch",
                    "paymentType": "COD"
                  }]
                )
              ,
              headers: {
                  "WWW-Authenticate" : "BASIC key",
                  "CLIENT_SECRET_KEY": 'key',   //If your header name has spaces or any other char not appropriate
                  "Content-Type": 'application/json'  //for object property name, use quoted notation shown in second
              },
              dataType: 'json',
              success: function (data) {
                  console.info(data);
              }
            });

            alert("Created order : "+orderNumber+ " in LogiNext...! "); // :)
      }
    }
    catch(err) {
          alert ("Unknown page...");
    }
  }
);
*/

/**
 *

*/
