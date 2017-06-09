// ==UserScript==
// @name           ThunderPlus.uc.js
// @namespace      https://raw.githubusercontent.com/nonoroazoro/firefox/master/userchrome/ThunderPlus.uc.js
// @description    迅雷下载链接嗅探。
// @charset        UTF-8
// @version        1.0
// ==/UserScript==

const ThunderPlus = {
    init: function ()
    {
        if (location.href === "chrome://browser/content/browser.xul")
        {
            window.thunderPlus = ThunderPlus;
        }
    },

    /**
     * copy download links to clipboard.
     */
    copy: function ()
    {
        Utils.copy(this._links.join("\n"));
    },

    get _links()
    {
        const result = [];
        const doc = content.document;
        result.push(...this._filter(doc.getElementsByTagName("a"), "href"));
        result.push(...this._filter(doc.getElementsByTagName("input"), "value"));
        result.push(...this._filter(doc.getElementsByTagName("textarea"), "value"));
        return [...new Set(result)].sort((a, b) => a.localeCompare(b));
    },

    _filter: (elements, key) =>
    {
        let value;
        const result = [];
        const regex = /(^ed2k:\/\/)|(^thunder:\/\/)|(^magnet:\?xt=)/i;
        for (const element of elements)
        {
            value = element[key].trim();
            if (regex.test(value))
            {
                result.push(value);
            }
        }
        return result;
    }
};

ThunderPlus.init();
