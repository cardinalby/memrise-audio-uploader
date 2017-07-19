function generateGpx(pois, metadataName, baseUrl) {

    var doc = document.implementation.createDocument("http://www.topografix.com/GPX/1/1", "gpx");

    function elem(name, content) {
        var el = doc.createElement(name);
        if (content !== undefined)
            el.appendChild(content);
        return el;
    }

    function text(textData) {
        return doc.createTextNode(textData);
    }

    var gpx = doc.documentElement;

    var metadata = elem("metadata");
    metadata.appendChild(elem("name", text(metadataName)));
    metadata.appendChild(elem("desc"));
    gpx.appendChild(metadata);

    for (var i = 0; i < pois.length; i++) {
        var wpt = elem("wpt");
        wpt.setAttribute("lat", pois[i].lat);
        wpt.setAttribute("lon", pois[i].lng);
        var wptName = pois[i].customHover.title + " (" + pois[i].overviewWeight.toFixed(1).toString() + ")";
        wpt.appendChild(elem("name", text(wptName)));
        wpt.appendChild(elem("desc", text(baseUrl + pois[i].url)));
        wpt.appendChild(elem("ele", text("0.000000")));

        gpx.appendChild(wpt);
    }

    return new XMLSerializer().serializeToString(doc);
}
