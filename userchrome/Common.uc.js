// ==UserScript==
// @name           Common.uc.js
// @description    公共库。
// @charset        UTF-8
// @version        1.0
// ==/UserScript==

/**
 * 常用工具箱。
 */
const Utils = (function ()
{
    const copy = function (p_string)
    {
        Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(p_string);
    };

    const create = function (p_name, p_attributes)
    {
        const element = content.document.createElement(p_name);
        if (p_attributes)
        {
            Object.keys(p_attributes).forEach(function (key)
            {
                element.setAttribute(key, p_attributes[key]);
            });
        }
        return element;
    };

    const toast = function (p_message, p_title)
    {
        Cc["@mozilla.org/alerts-service;1"].getService(Ci.nsIAlertsService).showAlertNotification("", p_title || "Firefox", p_message, false, "", null);
    };

    return {
        copy,
        create,
        toast
    };
})();
