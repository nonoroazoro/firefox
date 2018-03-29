// ==UserScript==
// @name           Common.uc.js
// @description    Common library for UserChrome.js.
// @charset        UTF-8
// @version        1.0  2018-03-20  Added support for Firefox Quantum.
// ==/UserScript==

/**
 * Common utilities for UserChrome.js
 */
const Common = {
    copy: function (str)
    {
        Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(str);
    },

    create: function (name, attributes)
    {
        const element = document.createElement(name);
        if (attributes)
        {
            Object.keys(attributes).forEach(function (key)
            {
                element.setAttribute(key, attributes[key])
            });
        }
        return element;
    },

    toast: function (message, title)
    {
        Components.classes["@mozilla.org/alerts-service;1"]
            .getService(Components.interfaces.nsIAlertsService)
            .showAlertNotification("", title || "UserChrome.js", message, false, "", null);
    }
};
