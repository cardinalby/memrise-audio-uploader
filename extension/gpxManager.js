function makeGpxFilesLinks(json, location, baseUrl) {

    function capitalizeFirstLetter(string) {
        //noinspection JSUnresolvedFunction
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    var groups = tripAdvisorPoiGroups;

    var links = [];
    for (var i = 0; i < groups.length; i++) {
        var groupName = groups[i];
        var groupData = json[groupName];
        var gpx = generateGpx(groupData, groupName, baseUrl);

        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        var url = getBlobUrl(gpx);
        var fileName = location + ". " + groupName + ".gpx";

        var linkText = capitalizeFirstLetter(groupName) + " (" + groupData.length + ")";
        var link = {name: linkText, url: url, fileName: fileName};
        links.push(link);
    }

    return links;
}
