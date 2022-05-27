class SotLanguage {
    /**
     * @param {string} code
     * @param {string} name
     */
    constructor (code, name) {
        this._code = code;
        this._name = name;
    }

    /**
     * @returns string
     */
    get code() {
        return this._code;
    }

    /**
     * @returns string
     */
    get name() {
        return this._name;
    }
}

let langs = [
        new SotLanguage("af-ZA", "Afrikaans"),
        new SotLanguage("sq", "Albanian"),
        new SotLanguage("ar-AE", "Arabic"),
        new SotLanguage("hy", "Armenian"),
        new SotLanguage("bn-BD", "Bengali (Bangladesh)"),
        new SotLanguage("bn-IN", "Bengali (India)"),
        new SotLanguage("bs", "Bosnian"), 
        new SotLanguage("ca-ES", "Catalan"),
        new SotLanguage("cmn-Hant-TW", "Chinese"),
        new SotLanguage("hr-HR", "Croatian"),
        new SotLanguage("cs-CZ", "Czech"),
        new SotLanguage("da-DK", "Danish"),
        new SotLanguage("nl-NL", "Dutch"),
        new SotLanguage("en-AU", "English (Australia)"),
        new SotLanguage("en-GB", "English (UK)"),
        new SotLanguage("en-US", "English (US)"),
        new SotLanguage("eo", "Esperanto"),
        new SotLanguage("fil-PH", "Filipino"),
        new SotLanguage("fi-FI", "Finnish"),
        new SotLanguage("fr-FR", "French"),
        new SotLanguage("fr-CA", "French (Canada)"),
        new SotLanguage("de-DE", "German"),
        new SotLanguage("el-GR", "Greek"),
        new SotLanguage("hi-IN", "Hindi"),
        new SotLanguage("hu-HU", "Hungarian"),
        new SotLanguage("is-IS", "Icelandic"),
        new SotLanguage("id-ID", "Indonesian"),
        new SotLanguage("it-IT", "Italian"),
        new SotLanguage("ja-JP", "Japanese (Japan)"),
        new SotLanguage("km", "Khmer"),
        new SotLanguage("ko-KR", "Korean"),
        new SotLanguage("la", "Latin"),
        new SotLanguage("lv", "Latvian"),
        new SotLanguage("mk", "Macedonian"),
        new SotLanguage("ne", "Nepali"),
        new SotLanguage("nb-NO", "Norwegian"),
        new SotLanguage("pl-PL", "Polish"),
        new SotLanguage("pt-BR", "Portuguese"),
        new SotLanguage("ro-RO", "Romanian"),
        new SotLanguage("ru-RU", "Russian"),
        new SotLanguage("sr-RS", "Serbian"),
        new SotLanguage("si", "Sinhala"),
        new SotLanguage("sk-SK", "Slovak"),
        new SotLanguage("es-MX", "Spanish (Mexico)"),
        new SotLanguage("es-ES", "Spanish (Spain)"),
        new SotLanguage("sw", "Swahili"),
        new SotLanguage("sv-SE", "Swedish"),
        new SotLanguage("ta", "Tamil"),
        new SotLanguage("th-TH", "Thai"),
        new SotLanguage("tr-TR", "Turkish"),
        new SotLanguage("uk-UA", "Ukrainian"),
        new SotLanguage("vi-VN", "Vietnamese"),
        new SotLanguage("cy", "Welsh")
    ];

class SotLanguageMap {
    /**
     * @param {string} name
     * @returns SotLanguage[]
     */
    static findByName(name) {
        return langs.filter(
            (/** SotLanguage */ value) => value.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
        );
    }
}