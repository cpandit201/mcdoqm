//Will invoke once Extension is instanlled and browser is loaded

console.log("Loginext Background Script Loaded...");

$(document).ready(function(){
  console.log("Background Script Loaded...");

  //Check whether token is still valid and set message accordingly

});

//If user presses an enter key - authenticate
$(document).on("keypress", function(e) {
        if (e.keyCode == 13) {
            authenticateLoginext();
        }
});

//If user clicks login button - authenticate
$(document).on('click', '.loginButton', function () {
  authenticateLoginext();
});

function authenticateLoginext ()
{

    //Get Values for username and password and create a call to loginext authenticate API
    var userName = $('#UserName').val();
    var password = $('#Password').val();
    console.log("Loggin in with User : "+userName);
    $('#message').html("<img src='loading_icon.gif'/>");
    //Log in to - https://products.loginextsolutions.com/LoginApp/login/authenticate
    $.ajax({
      url: "https://products.loginextsolutions.com/LoginApp/login/authenticate",
      type: 'post',
      contentType: "application/json",
      data:
      JSON.stringify(
            {
              "sessionExpiryTimeout":72,
              "userName":userName,//"malaysia_ondemand_sandbox@loginextsolutions.com",
              "password":password//"kz2ncIKTShHjwEQF1Cl"
            }
        )
      ,
      headers: {
          //"WWW-Authenticate" : "BASIC cf4b42d6-d5a0-4741-883e-cb9bd54528d3",
          //"CLIENT_SECRET_KEY": '$2a$08$.NfnF2qLT092H/ifNnV1e.FkDgc2xziIohoCg0VPV8uE.nXdmo0M6',   //If your header name has spaces or any other char not appropriate
          "Content-Type": 'application/json'  //for object property name, use quoted notation shown in second
      },
      dataType: 'json',
      beforeSend: function(){
        //log ("Loading...");
      },
      success: function (data, textStatus, request) {
        try {
          if (data.status === 200) {
            console.log("Logged in successfully");
            chrome.storage.sync.set({ "userName_storeOwner": userName}, function(){ console.log("Stored username"); });
            chrome.storage.sync.set({ "Authenticate": request.getResponseHeader('WWW-Authenticate')}, function(){ console.log("Token Set"); });
            chrome.storage.sync.set({ "CLIENT_SECRET_KEY": request.getResponseHeader('CLIENT_SECRET_KEY')}, function(){ console.log("Client Secret key Set"); });
            //console.log("CLIENT_SECRET_KEY : "+request.getResponseHeader('CLIENT_SECRET_KEY'));
            //console.log("Authenticate : "+request.getResponseHeader('WWW-Authenticate'));
            $('#message').html("Logged In Successfully using "+userName);
          }
          else {
            console.log("Login in error...");
            console.log(data);
            $('#message').html("Error in loggin in..");
          }
        }
        catch (err) {
          console.log(data);
          $('#message').html("Error in loggin in..");
        }
        //console.info(data);
      },
      error: function(xhr){
        $('#message').html("Error in loggin in..");
        console.log("An error occured: " + xhr.status + " " + xhr.statusText);
      }
    });

    //Store data in Chrome Session


    //alert("Loaded..!");

}

/**
$('#loginButton').click (function (){
  alert("loaded..");
});
*/

//  PERSISTENT Storage - Globally
//  Save data to storage across their browsers...
/*
chrome.storage.sync.set({ "yourBody": "myBody" }, function(){
    //  A data saved callback omg so fancy
});


chrome.storage.sync.get(["yourBody"], function(items){
    //  items = [ { "yourBody": "myBody" } ]
});
*/
/*
chrome.browserAction.onClicked.addListener(clickedBackgroundScript);

function clickedBackgroundScript (tab){
  console.log("Sending Message to contentscript on tab - "+tab);

  //Message
  var messageObj = {
    messageString : "My Message"
  }
  chrome.tabs.sendMessage (tab.id, messageObj);
}
*/
