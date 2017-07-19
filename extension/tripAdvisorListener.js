function downloadResult(tabId, success, info) {
    this.tabId = tabId;
    this.success = success;
    this.info = info;
}

function poiInfo(rating, prominent)
{
    this.rating = rating;
    this.prominent = prominent;
}

const tripAdvisorPoiGroups = ["hotels", "attractions", "restaurants"];

var tripAdvisorListener = {

    data: {},

    startListen: function () {
        chrome.tabs.onUpdated.addListener(this.onTabsUpdated.bind(this));
        chrome.tabs.onRemoved.addListener(this.onTabsRemoved.bind(this));
        this.poiRequestSubscribe();
    },

    downloadPoiForTabId: function(tabId, callback)
    {
        if (!tabId || !data || data.length == 0 || !data[tabId])
            callback(new downloadResult(tabId, false, null));

        var xhr = new XMLHttpRequest();
        xhr.open("GET", data[tabId].url, true);
        xhr.onreadystatechange = function () { this.onPoiRequestCompleted(xhr, tabId, callback); }.bind(this);
        xhr.send();
    },

    onPoiDownloaded: function(xhr, tabId, callback)
    {
        if (xhr.readyState != 4)
            return;

        if (xhr.status != 200) {
            callback(new downloadResult(tabId, false, null));
            return;
        }

        var json = JSON.parse(xhr.responseText);
        data[tabId].json = json;

        for (var i = 0; i < tripAdvisorPoiGroups.length; i++) {
            var groupName = tripAdvisorPoiGroups[i];
            var groupPoi = json[groupName];
            if (!groupPoi)
                continue;
            var groupInfo = [];
            for (var p = 0; p < groupPoi.length; p++) {
                
            }
        }

        var result = new downloadResult(tabId, true, null);
        callback(tabId, result);
    },

    onTabsUpdated: function(tabId, changeInfo, tab)
    {
        chrome.pageAction.hide(tabId);
        if (this.data !== undefined && this.data[tabId] != undefined)
            delete this.data[tabId];
    },

    onTabsRemoved: function(tabId, removeInfo)
    {
        if (this.data !== undefined && this.data[tabId] != undefined)
            delete this.data[tabId];
    },

    poiRequestSubscribe: function() {
        chrome.webRequest.onCompleted.addListener(
            this.onPoiRequestCaptured.bind(this),
            {urls: ["*://*/GMapsLocationController?Action=display*"]});
    },

    onPoiRequestCaptured: function(details)
    {
        if (details.tabId === undefined || details.tabId  < 0)
            return;
        
        if (this.data === undefined)
            this.data = {};

        chrome.tabs.get(details.tabId, function (tab) {
            this.data[details.tabId] = {
                url: details.url,
                location: this.getLocationFromTitle(tab.title)
            };

            chrome.pageAction.show(details.tabId);
        }.bind(this));
    },

    getLocationFromTitle: function (title) {
        var re = /The Top \d{1,3} .{3,30} in (.{1,50}) - TripAdvisor/;
        var result = re.exec(title);
        if (!result || !result[1])
            return title;
        else
            return result[1];
    }
};
