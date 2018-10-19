//Will instantiate on every tab we enter
console.log("Ready to go...");

var wwwAuthToken = "";
var clientSecretKey = "";


$(document).bind('keypress', function(event) {

  //When 'Shift + L' is pressed - Call Loginext Load Order
  if (event.shiftKey && event.which === 76) { //Ascii code for 'L'
    testConnection();
    loadOrder();
  }

  //When 'Shift + C' is pressed - Call Loginext Cancel Order API
  if (event.shiftKey && event.which === 67) { //Ascii code for 'C'
    testConnection();
    cancelOrder();
  }
});

//Fetch Loginext API Tokens - //Get User Access Token
chrome.storage.sync.get(["Authenticate"], function(items) {
  console.log("Authenticate key");
  if (typeof items.Authenticate === "undefined") {
    //alert("Please Login to Loginext by clicking Loginext icon on top right");
  } else {
    console.log("Setting Auth Key to " + items.Authenticate);
    wwwAuthToken = items.Authenticate;
  }
  //console.log (items.Authenticate);
  //console.log(items);
});

//Get Clent Secret Key
chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
  console.log("Setting Client key to " + items.CLIENT_SECRET_KEY);
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

function testConnection() {

  $.ajax({
    url: "https://products.loginextsolutions.com",
    timeout: 1000,
    statusCode: {
      200: function(response) {
        //alert('Working!');
      },
      400: function(response) {
        alert('Unable to reach products.loginextsolutions.com!');
      },
      0: function(response) {
        //alert('Unable to reach products.loginextsolutions.com!');
      }
    }
  });

}

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
        alert("Please Login to Loginext by clicking Loginext icon on top right");
        return;
      } else {
        console.log("Setting Auth Key to " + items.Authenticate);
        wwwAuthToken = items.Authenticate;
      }
      //console.log (items.Authenticate);
      //console.log(items);
    });

    //Get Clent Secret Key
    chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
      console.log("Setting Client key to " + items.CLIENT_SECRET_KEY);
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
    var lat = latLongs_array[0];
    var long = latLongs_array[1];
    var num_lat = 0;
    var num_long = 0;
    try {
      num_lat = parseFloat(lat);
      num_long = parseFloat(long);
    } catch (err) {
      console.log("Unable to convert lat long will be zeroed to default..");
      log("Unable to convert lat long will be zeroed to default..");
    }

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

    if (phoneNumberText.length > 10) {
      phoneNumberText = phoneNumberText.substring(0, 10);
      phoneNumberText = phoneNumberText.trim();
    }

    //Fetch Loginext API Tokens
    //Get User Access Token
    var isLoggedIn = false;
    chrome.storage.sync.get(["Authenticate"], function(items) {
      console.log("Authenticate key");
      if (typeof items.Authenticate === "undefined") {
        //alert("Please Login to Loginext by clicking Loginext icon on top right");
      } else {
        console.log("Setting Auth Key to " + items.Authenticate);
        wwwAuthToken = items.Authenticate;
        isLoggedIn = true;
      }
      //console.log (items.Authenticate);
      //console.log(items);
    });

    //Get Clent Secret Key
    chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
      console.log("Setting Client key to " + items.CLIENT_SECRET_KEY);
      clientSecretKey = items.CLIENT_SECRET_KEY;
      console.log(items.CLIENT_SECRET_KEY);
      console.log(items);
    });

    //userName_storeOwner
    var userName_storeOwner = "";
    chrome.storage.sync.get(["userName_storeOwner"], function(items) {
      console.log("Setting Client key to " + items.userName_storeOwner);
      userName_storeOwner = items.userName_storeOwner;
      console.log(items.userName_storeOwner);
      console.log(items);
    });

    //McD Order Invoice should have a hidden element of id = __VIEWSTATEGENERATOR
    //if (document.getElementById("__VIEWSTATEGENERATOR") == null) {
    if ((document.title == ("Order Queue Manager - Cash Memorandum")) == false) {
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
      /*
      document.getElementById("__VIEWSTATEGENERATOR").parentNode.appendChild(para);
      document.getElementById("__VIEWSTATEGENERATOR").parentNode.appendChild(br);
      document.getElementById("__VIEWSTATEGENERATOR").parentNode.appendChild(br);
      */

      document.body.appendChild(para);
      document.body.appendChild(br);
      document.body.appendChild(br);

      //Realign Div at start
      document.body.insertBefore(para, document.body.firstChild);

    } else {
      log("Reload...");
    }

    console.log("Auth Tokens : " + wwwAuthToken + "," + clientSecretKey);

    //Get Branch Data for that user from - https://cpandit201.github.io/mcdoqm/branch.json
    $.ajax({
      url: "https://cpandit201.github.io/mcdoqm/branch.json",
      type: 'GET',
      contentType: "application/json",
      dataType: 'json',
      beforeSend: function() {
        //log ("Loading...");
      },
      success: function(data) {
        try {
          if (data.length > 0) {
            log("Branch Data fetched");
            var isBranchFound = false;
            for (var i = 0; i < data.length; i++) {
              var currentConfig = data[i];
              if (currentConfig.user == userName_storeOwner) {
                isBranchFound = true;

                //branch -
                var userBranch = currentConfig.branch;

                //Load Order
                log("Adding Order, Please wait..");
                addOrderToLoginext(
                  orderNumber,
                  totalAfterRoundingText,
                  custText,
                  addressText,
                  phoneNumberText,
                  orderNumber,
                  userBranch,
                  num_lat,
                  num_long
                );
                //Load Order End
                break;
              }

            } //For loop end

            //If branch data is not found.. inform user that branch for this user name does not exists in configuration
            if (isBranchFound == false) {
              if (isLoggedIn === false) {
                log("Please login to Loginext Chrome Extension");
              }
              else {
                log("Branch Data for username : " + userName_storeOwner + " is not fetched, Please contact support to add your branch configuration");
              }
            }

          } else {
            log("No Branch Data fetched");
          }
        } catch (err) {
          log("Error in parsing response output.");
        }
        //console.info(data);
      },
      error: function(xhr) {
        if (xhr.status=== 401) {
          log("Please login from Loginext Chrome Extension");
        }
        else if (xhr.status=== 403) {
          log("Access denied to Loginext, Please contact support");
        }
        else {
          log("An error occured: " + xhr.status + " " + xhr.statusText + "<br/> " + JSON.stringify(xhr));
        }
      }
    });
  } catch (err) {
    //alert("Unknown page please refer Order Invoice Page to process data...");
    console.log("Current page is not order invoice ");
    log("Unknown page...");
  }

}


function addOrderToLoginext(
  orderNumber,
  totalAfterRoundingText,
  custText,
  addressText,
  phoneNumberText,
  orderNumber,
  userBranch,
  num_lat,
  num_long
) {

  //Call Loginext OD Add Order API
  $.ajax({
    url: "https://products.loginextsolutions.com/ShipmentApp/ondemand/v1/create",
    type: 'post',
    contentType: "application/json",
    data: JSON.stringify(
      [{
        "cashOnDelivery": totalAfterRoundingText,
        "customerName": custText,
        //"locality": "McD Malaysia",
        //"subLocality": "Petaling Jaya",
        "address": addressText,
        "deliverPhoneNumber": phoneNumberText,
        "orderNo": orderNumber,
        "distributionCenter": userBranch,
        "paymentType": "COD",
        "latitude": num_lat, //31.1370445,
        "longitude": num_long //80.6210216
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
          var errorOutput = JSON.stringify(data);

          if (errorOutput.includes("orders are duplicate")) {
            log("Cannot Add, Order number : '" + orderNumber + "' is duplicate present in loginext");
          } else if (errorOutput.includes("Not a valid mobile number")) {
            log("Cannot Add, Order number : '" + orderNumber + "' Not a valid mobile number");
          }
          //branches does not exist
          else if (errorOutput.includes("branches does not exist")) {
            log("Cannot Add Order, Branch '" + userBranch + "' does not exists in loginext, Please contact support");
          } else {
            //log(data.status + " : " + data.message + "\n "+ errorOutput);
            log(data.status + " \n Error Json : " + errorOutput);
            log("Unable to add order in loginext, Please contact support");
          }
        }
      } catch (err) {
        log("Error in parsing response output.");
      }
      //console.info(data);
    },
    error: function(xhr) {

        if (xhr.status=== 401) {
          log("Please login from Loginext Chrome Extension");
        }
        else if (xhr.status=== 403) {
          log("Access denied to Loginext, Please contact support");
        }
        else {
          log("An error occured: " + xhr.status + " " + xhr.statusText + "<br/> " + JSON.stringify(xhr));
        }
    }
  });

}

/**
 * Will load order from OQM to Loginext
 */
function cancelOrder() {
  try {
    //Ask user to login if token is not setAttribute

    //Fetch Loginext API Tokens
    //Get User Access Token
    chrome.storage.sync.get(["Authenticate"], function(items) {
      console.log("Authenticate key");
      if (typeof items.Authenticate === "undefined") {
        alert("Please Login to Loginext by clicking Loginext icon on top right");
      } else {
        console.log("Setting Auth Key to " + items.Authenticate);
        wwwAuthToken = items.Authenticate;
      }
      //console.log (items.Authenticate);
      //console.log(items);
    });

    //Get Clent Secret Key
    chrome.storage.sync.get(["CLIENT_SECRET_KEY"], function(items) {
      console.log("Setting Client key to " + items.CLIENT_SECRET_KEY);
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


    //McD Order Invoice should have a hidden element of id = __VIEWSTATEGENERATOR
    //if (document.getElementById("__VIEWSTATEGENERATOR") == null) {
    if ((document.title == ("Order Queue Manager - Cash Memorandum")) == false) {
      alert("Unknown Page, please refer Invoice page to process data");
      return;
    }

    if (document.getElementById('messageText') == null) {

      //Setting a message box on web page
      var para = document.createElement("h3");
      var t = document.createTextNode("Loginext - Loading Cancel Order... Please wait");
      para.appendChild(t);

      //Set attributes for further logging
      para.setAttribute("align", "center");
      para.setAttribute("id", "messageText");
      para.setAttribute("name", "messageText");

      var br = document.createElement("br");
      document.body.appendChild(para);
      document.body.appendChild(br);
      document.body.appendChild(br);

      //Realign Div at start
      document.body.insertBefore(para, document.body.firstChild);

    } else {
      log("Loginext - Loading Cancel Order... Please wait...");
    }

    console.log("Auth Tokens : " + wwwAuthToken + "," + clientSecretKey);


    //Fetch the reference ID for this Order from Loginext Get Order Listing
    log("Verifying Order : '" + orderNumber + "' exists in Loginext"); // Get its reference id

    var orderData;

    //Get All Orders List view -POST -  https://products.loginextsolutions.com/ShipmentApp/shipment/fmlm?pageNumber=1&pageSize=200&status=ALL
    $.ajax({
      url: "https://products.loginextsolutions.com/ShipmentApp/ondemand/v1/shipment?status=ALL&order_no=" + orderNumber,
      type: 'get',
      contentType: "application/json",
      async: false,
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
          if (data.status === 200 && data.message === "SUCCESS") {
            log("Fetched data for " + orderNumber + " in Loginext");
            orderData = data; // Assign Order Data for further use

            if (orderData.data.length > 0) {
              //Get Order Shipment ID
              var shipmentID = getOrderShipmentID(orderData, orderNumber);
              if (shipmentID.referenceId == null || shipmentID.referenceId.length <= 1) {
                log("Cannot cancel - Order " + orderNumber + " - no ref id fetched. ");
                return;
              } else {
                log("Fetched orderID " + shipmentID + " in Loginext, Attempting to Cancel");
                var isShipmentCancelled = cancelShipmentID(shipmentID.referenceId, orderNumber, shipmentID);
              }
            } else {
              log("Cannot cancel - Order is not present in Loginext");
            }
          } else if (data.status === 401 && data.message === "Invalid token") {
            log("Please login from Loginext Chrome Extension");
          } else {
            var errorOutput = JSON.stringify(data);
            log(data.status + " \n Error Json : " + errorOutput);
          }
        } catch (err) {
          log("Error in parsing response output.");
        }
      },
      error: function(xhr) {

          if (xhr.status=== 401) {
            log("Please login from Loginext Chrome Extension");
          }
          else if (xhr.status=== 403) {
            log("Access denied to Loginext, Please contact support");
          }
          else {
            log("An error occured: " + xhr.status + " " + xhr.statusText + "<br/> " + JSON.stringify(xhr));
          }
      }
    });


  } catch (err) {
    //alert("Unknown page please refer Order Invoice Page to process data...");
    console.log("Current page is not order invoice ");
    log("Unknown page...");
  }

}

//Will return shipment id for a given expected order number
var getOrderShipmentID = function getOrderShipmentID(orderData, expectedOrderNumber) {

  if (orderData == null) {
    log("Order data is not assigned, exit");
    return;
  }

  //Loop through and get order reference id
  var orderResults = orderData.data; //
  for (var i = 0; i < orderResults.length; i++) {
    var currentOrderResult = orderResults[i];
    var referenceId = currentOrderResult.referenceId;
    var orderNumberFromServer = currentOrderResult.orderNo;
    if (orderNumberFromServer == expectedOrderNumber) {
      return currentOrderResult; //referenceId;
    }
  }
}


//Will send a cancellation request to a given shipment id
var cancelShipmentID = function cancelShipmentID(shipmentId, strOrderNumber, jsonShipmentData) {

  //if order status is among these - should be allowed to cancel - NOTDISPATCHED / INTRANSIT / PICKEDUP / NOTDELIVERED (Attempted Delivered) / NOTPICKEDUP (Attempted Pickup)
  if (jsonShipmentData.status == "NOTDISPATCHED" ||
    jsonShipmentData.status == "INTRANSIT" ||
    jsonShipmentData.status == "PICKEDUP" ||
    jsonShipmentData.status == "NOTDELIVERED" ||
    jsonShipmentData.status == "NOTPICKEDUP"
  ) {
    //Call Loginext OD - Cancel Order
    console.log("Attempting to cancel : " + shipmentId);
    var rc = false;
    $.ajax({
      url: "https://products.loginextsolutions.com/ShipmentApp/ondemand/v1/cancel",
      type: 'put',
      async: false,
      contentType: "application/json",
      data: JSON.stringify(
        [
          shipmentId
        ]
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
          if (data.status === 200 && data.data === "Order(s) cancelled successfully") {
            log("Canceled order : " + strOrderNumber + " in Loginext\n" + "RefID " + shipmentId);
            rc = true;
          } else {
            var errorOutput = JSON.stringify(data);
            log(data.status + " \n Error Json : " + errorOutput);
            rc = false;
          }
        } catch (err) {
          log("Error in parsing response output.");
          rc = false;
        }
      },
      error: function(xhr) {

          if (xhr.status=== 401) {
            log("Please login from Loginext Chrome Extension");
          }
          else if (xhr.status=== 403) {
            log("Access denied to Loginext, Please contact support");
          }
          else {
            log("An error occured: " + xhr.status + " " + xhr.statusText + "<br/> " + JSON.stringify(xhr));
          }

        rc = false;
      }
    });
    return rc;
  } else if (jsonShipmentData.status == "CANCELLED") {
    log("Unable to cancel order : " + strOrderNumber + "\n Order Status is already : " + jsonShipmentData.status + " in Loginext.");
    return false;
  } else {
    log("Unable to cancel order : " + strOrderNumber + "\n Order Status is : " + jsonShipmentData.status + " in Loginext \nOnly Orders will be cancelled having statuses (NOTDISPATCHED / INTRANSIT / PICKEDUP / NOTDELIVERED (Attempted Delivered) / NOTPICKEDUP (Attempted Pickup)).");
    return false;
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
