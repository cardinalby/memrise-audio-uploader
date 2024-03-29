class MemriseCourse {
    constructor() {
        /** @type {MemriseCourseWordRow[]} */
        this.rows = [];

        /** @type {string} */
        this.wordsLanguage = undefined;
        this.middlewareToken = undefined;
    };

    async initialize() {
        this.middlewareToken = await this._grabMemriseToken();

        // course levels tab
        let $tables = $('table.level-things.table');
        if (!$tables.length) {
            // databases tab
            $tables = $('table.pool-things');
        }

        this.rows = [];
        this.wordsLanguage = undefined;

        for (const table of $tables) {
            const $table = $(table);
            const $rows = $table.find('tr.thing');

            const wordsLanguage = $table.find('th.column[data-key="1"]').find('span.txt').text();
            if (this.wordsLanguage === undefined) {
                this.wordsLanguage = wordsLanguage;
            } else if (this.wordsLanguage !== wordsLanguage) {
                throw new Error('Different languages of levels are not supported');
            }
            $rows.each((index, $row) => {
                this.rows.push(new MemriseCourseWordRow($row));
            });
        }

        return this.rows;
    };

    async uploadSound(/** MemriseCourseWordRow */ row, /** Blob */ sound) {
        const data = new FormData();
        data.append('thing_id', row.thingId);
        data.append('cell_id', row.audioCellId);
        data.append('cell_type', 'column');
        data.append('csrfmiddlewaretoken', this.middlewareToken);
        data.append('f', sound, 'file.mp3');

        const xhr = createXMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.onreadystatechange = function () {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        try {
                            const response = JSON.parse(this.response);
                            if (response.success) {
                                resolve(response);
                            } else {
                                reject(new Error(this.response));
                            }
                        }
                        catch (err) {
                            reject(err);
                        }
                    }
                    else {
                        reject(this.status + ' ' + this.response);
                    }
                }
            };

            xhr.open('POST', window.location.origin + '/ajax/thing/cell/upload_file/');
            xhr.processData = false;
            xhr.send(data);
        });
    };

    /**
     * @return {Promise<string>}
     * @private
     */
    async _grabMemriseToken() {
        function injectGrabbingScriptToThePage() {
            const th = document.getElementsByTagName('body')[0];
            const s = document.createElement('script');
            s.setAttribute('type', 'text/javascript');
            s.setAttribute('src', chrome.runtime.getURL('js/content/pageInjectedScript.js'));
            th.appendChild(s);
        }

        return new Promise((resolve, reject) => {
            const rejectTimeout = setTimeout(reject, 1500);

            const eventListener = event => {
                document.removeEventListener('mau-set-memrise-token', eventListener);
                clearTimeout(rejectTimeout);
                resolve(event.detail);
            };
            document.addEventListener('mau-set-memrise-token', eventListener);

            injectGrabbingScriptToThePage();
        });
    };
}