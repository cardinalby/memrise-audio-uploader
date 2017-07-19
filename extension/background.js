tripAdvisorListener.startListen();

//noinspection JSCheckFunctionSignatures
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.name == messages.MAKE_GPX)
    {
        getActiveTab(makeGpxAndSendToPopup);
    }
});

function makeGpxAndSendToPopup(tab)
{
    var capturedUrls = tripAdvisorListener.data;
    if (!tab.id || !capturedUrls || capturedUrls.length == 0 || !capturedUrls[tab.id])
    {
        chrome.runtime.sendMessage({
            name: messages.GPX_CREATION_FAILED,
            message: "Capturing data error. Try in new tab."});
        return;
    }

    var requestUrl = capturedUrls[tab.id].url;
    var location = capturedUrls[tab.id].location;
    sendPoiRequest(requestUrl, location);
}

function sendPoiRequest(url, location)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () { onPoiRequestCompleted(xhr, url, location) };
    xhr.send();
}

function onPoiRequestCompleted(xhr, url, location)
{
    if (xhr.readyState != 4)
        return;

    if (xhr.status != 200) {
        chrome.runtime.sendMessage({
            name: messages.GPX_CREATION_FAILED,
            message: "Response failed with status " + xhr.status
        });
        return;
    }

    var json = JSON.parse(xhr.responseText);
    var links = makeGpxFilesLinks(json, location, extractBaseUrl(url));
    
    chrome.runtime.sendMessage({name: messages.GPX_CREATED, links: links});
}

function extractBaseUrl(url) {
    var re = /(http(s)?:\/\/.*?)\/GMapsLocationController\?Action=display/;
    var baseUrl = re.exec(url)[1];
    return baseUrl ? baseUrl : "https://tripadvisor.com";
}




