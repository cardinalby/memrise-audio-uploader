var UploadManager = function (maxConcurrentUploads) {
    this.maxConcurrentUploads = maxConcurrentUploads;
};

UploadManager.prototype.startAutoUpload = function (doneCallback) {
    var self = this;

    memriseCourse.readRows();

    chrome.runtime.sendMessage({
        name: 'mau-get-lang-code',
        languageName: memriseCourse.wordsLanguage
    }, function (response)
    {
        if (response.success)
        {
            var langCode = response.code;
            var uploadsCount = 0;
            var rowIndex = 0;

            function startNewUploads() {
                while (uploadsCount < self.maxConcurrentUploads &&
                       rowIndex < memriseCourse.rows.length)
                {
                    if (!memriseCourse.rows[rowIndex].hasSound) {
                        ++uploadsCount;
                        var uploading = self.uploadForRow(memriseCourse.rows[rowIndex], langCode);
                        uploading.always(function () {
                            --uploadsCount;
                            startNewUploads();
                        });
                    }

                    ++rowIndex;
                }

                if (rowIndex === memriseCourse.rows.length && doneCallback)
                    doneCallback();
            }

            startNewUploads();
        }
        else
            console.log(response.error);
    });
};

UploadManager.prototype.uploadForRow = function(row, languageCode)
{
    var deferred = $.Deferred();

    chrome.runtime.sendMessage({
            name: 'mau-load-sound',
            word: row.word,
            languageCode: languageCode
        },
        function (response) {
            var uploading = memriseCourse.uploadSound(row, response);
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
