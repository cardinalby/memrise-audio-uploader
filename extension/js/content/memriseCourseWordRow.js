class MemriseCourseWordRow {
    constructor(element) {
        this.$element = $(element);

        this.word = this.$element
            .find('td.cell.text.column[data-key="1"]')
            .find('div.text')
            .text();
        this._findAudioCell();
        this.thingId = this.$element.attr('data-thing-id');
        this.hasSound = this._isHasSound();

        this._observeSoundChanges();
    };

    replaceAudioCell(/** string */ html) {
        this.$audioCell.replaceWith($(html));
        this._findAudioCell();
    };

    audioCellShowPendingMsg() {
        this._showMessageWithIndicators('⚪️⚪');
    };

    audioCellShowErrorMsg(type) {
        function getErrIndicators(type) {
            switch (type) {
                case 'download': return '🔴⚪';
                case 'upload': return '⚫🔴';
                default: return '🔴🔴';
            }
        }
        this._showMessageWithIndicators(getErrIndicators(type));
        setTimeout(() => this.audioCellClearMessage(), 2500);
    };

    audioCellShowRequestingMsg() {
        this._showMessageWithIndicators('⚫⚪️️');
    };

    audioCellShowUploadingMsg() {
        this._showMessageWithIndicators('⚫⚫️');
    };

    audioCellClearMessage() {
        if (this.$messageSpan) {
            this.$messageSpan.remove();
        }
        this.$messageSpan = undefined;
        this.$btnGroup.show();
    }

    _showMessageWithIndicators(indicators) {
        this.$btnGroup.hide();

        if (this.$messageSpan) {
            this.$messageSpan.remove();
        }
        this.$messageSpan = $(`<span data-role="mau-message" class="btn btn-mini">${indicators} Auto uploading...</span>`);
        this.$audioCell.append(this.$messageSpan);
    }

    _findAudioCell() {
        this.$audioCell = this.$element.find('td.cell.audio.column');
        this.$btnGroup = this.$audioCell.find('div.btn-group');
        this.audioCellId = this.$audioCell.attr('data-key');
        this.$messageSpan = this.$audioCell.find('span[data-role="mau-message"]');
        if (!this.$messageSpan.length) {
            this.$messageSpan = undefined;
        }
    }

    _isHasSound() {
        const $audiosMenu = this.$audioCell.find('div.dropdown-menu.audios');
        return $audiosMenu.length && $audiosMenu.children().length > 0;
    };

    _observeSoundChanges() {
        this.mutationObserver = (new MutationObserver(() => {
            this._findAudioCell();
            this.hasSound = this._isHasSound();
        }));

        this.mutationObserver.observe(
            this.$element[0],
            { childList: true, subtree: true, attributes: false, characterData: false }
        );
    }
}