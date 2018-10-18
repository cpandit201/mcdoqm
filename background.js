//Will invoke once Extension is instanlled and browser is loaded

console.log("Loginext Background Script Loaded...");

chrome.browserAction.onClicked.addListener(clickedBackgroundScript);

function clickedBackgroundScript (tab){
  console.log("Sending Message to contentscript on tab - "+tab);

  //Message
  var messageObj = {
    messageString : "My Message"
  }
  chrome.tabs.sendMessage (tab.id, messageObj);
}
