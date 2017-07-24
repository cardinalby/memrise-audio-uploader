var UploadManager = function (maxConcurrentUploads) {
    this.maxConcurrentUploads = maxConcurrentUploads;
    this.stopping = false;
};

UploadManager.prototype.startAutoUpload = function (progressCallback, doneCallback) {
    var self = this;

    this.stopping = false;
    var rows = $.grep(memriseCourse.readRows(), function (row) {
        return !row.hasSound;
    });

    chrome.runtime.sendMessage({
        name: 'mau-get-lang-code',
        languageName: memriseCourse.wordsLanguage
    }, function (response)
    {
        if (response.success)
        {
            var langCode = response.code;
            var uploadsCount = 0;
            var doneCount = 0;
            var rowIndex = 0;

            function startNewUploads() {
                while (uploadsCount < self.maxConcurrentUploads &&
                       rowIndex < rows.length &&
                       !self.stopping)
                {
                    ++uploadsCount;
                    var uploading = self.uploadForRow(rows[rowIndex], langCode);
                    uploading.always(function () {
                        ++doneCount;
                        --uploadsCount;

                        if (progressCallback)
                            progressCallback(doneCount, rows.length);

                        startNewUploads();
                    });

                    ++rowIndex;
                }

                if ((rowIndex === rows.length ||
                    self.stopping && uploadsCount === 0) &&
                    doneCallback)
                {
                    doneCallback();
                }
            }

            startNewUploads();
        }
        else
            console.log(response.error);
    });
};

UploadManager.prototype.stopUploading = function() {
    this.stopping = true;
};

UploadManager.prototype.base64ToBlob = function(base64, contentType) {
    var binary = atob(base64);
    var len = binary.length;
    var buffer = new ArrayBuffer(len);
    var view = new Uint8Array(buffer);
    for (var i = 0; i < len; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return new Blob([view], {type: contentType});
};

UploadManager.prototype.uploadForRow = function(row, languageCode)
{
    var self = this;
    var deferred = $.Deferred();

    chrome.runtime.sendMessage({
            name: 'mau-load-sound',
            word: row.word,
            languageCode: languageCode
        },
        function (response) {
            if (!response || !response.success) {
                deferred.reject();
                return;
            }

            if (row.hasSound)
                return;

            var sound = self.base64ToBlob(response.sound, 'audio/mp3');

            var uploading = memriseCourse.uploadSound(row, sound);

            var removeUploadingMsg = row.audioCellAddUploadingMsg();

            uploading.always(removeUploadingMsg);

            uploading.done(function (response) {
                if (response.success)
                    row.replaceAudioCell(response.rendered);
                else
                    row.audioCellAddErrorMsg();
                deferred.resolve();
            });

            uploading.fail(function () {
                row.audioCellAddErrorMsg();
                deferred.reject();
            });
        });

    return deferred;
};

var uploadManager = new UploadManager(3);
