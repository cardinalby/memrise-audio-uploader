var InjectedBtn = function () {
    this.$element = undefined;
};

InjectedBtn.prototype.createBtn = function () {
    return this.$element =
        $('<button>')
            .text('Auto upload')
            .addClass('btn')
            .addClass('btn-small')
            .click(this.onClick.bind(this));
};

InjectedBtn.prototype.onClick = function () {
    memriseCourse.readRows();
    return false;
};

var injectedBtn = new InjectedBtn();

var observer = new MutationObserver(function (mutations, observer) {
    for (var i = 0; i < mutations[0].addedNodes.length; i++) {
        if (mutations[0].addedNodes[i].nodeType === 1) {
            var $audioLabel = $(mutations[0].addedNodes[i]).find("th.column.audio > span.txt");
            if ($audioLabel.length)
                injectedBtn.createBtn().insertBefore($audioLabel.next());
        }
    }
});

observer.observe(
    document.body,
    { childList: true, subtree: true, attributes: false, characterData: false });

