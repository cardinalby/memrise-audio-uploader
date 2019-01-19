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

    audioCellAddErrorMsg() {
        const errorSpan = '<span style="color: red" class="mau-upload-error"> Error</span>';
        this.$audioCell.append(errorSpan);

        setTimeout(function () {
            this.$element.find('span.mau-upload-error').remove();
        }.bind(this), 2500)
    };

    audioCellAddUploadingMsg() {
        const msgSpan = '<span class="mau-uploading-msg"> Uploading...</span>';
        this.$audioCell.append(msgSpan);

        return function () {
            this.$element.find('span.mau-uploading-msg').remove();
        }.bind(this);
    };

    _findAudioCell() {
        this.$audioCell = this.$element.find('td.cell.audio.column');
        this.audioCellId = this.$audioCell.attr('data-key');
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