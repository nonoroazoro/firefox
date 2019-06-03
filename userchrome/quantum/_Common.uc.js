// ==UserScript==
// @name           Common.uc.js
// @description    Common library for UserChrome.js.
// @charset        UTF-8
// @version        1.1  2019-05-22  Added Services and log.
// @version        1.0  2018-03-20  Added support for Firefox Quantum.
// ==/UserScript==

/**
 * Common utilities for UserChrome.js
 */
const Common = {
    copy(str)
    {
        Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(str);
    },

    create(name, attributes)
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

    /**
     * Open URL in new Tab.
     *
     * See https://github.com/alice0775/userChrome.js/blob/master/MouseGestures2_e10s.uc.js
     */
    openURL(url, inBackground = false)
    {
        // Use openTrustedLinkIn
        openTrustedLinkIn(url, "tab", { inBackground });

        // Or use openTrustedLinkIn
        // gBrowser.loadOneTab(url, {
        //     relatedToCurrent: true,
        //     inBackground,
        //     referrerURI: BrowserUtils.makeURI(url),
        //     triggeringPrincipal: Services.scriptSecurityManager.createNullPrincipal({})
        // });
    },

    toast(message, title)
    {
        Components.classes["@mozilla.org/alerts-service;1"]
            .getService(Components.interfaces.nsIAlertsService)
            .showAlertNotification("", title || "UserChrome.js", message, false, "", null);
    },

    log(message)
    {
        if (typeof message === "object")
        {
            Services.console.logStringMessage(Object.keys(message).sort().join("\n"))
        }
        Services.console.logStringMessage(message);
    },

    /**
     * Find the element of Firefox and do the command.
     *
     * @param {string} id The id of the addon.
     * @param {boolean} [inNavbar=false] Indicates if the addon is currently hidden in the nav bar.
     */
    doCommand(id, inNavbar = false)
    {
        if (inNavbar)
        {
            document.getElementById("nav-bar-overflow-button").click();
            setTimeout(() =>
            {
                document.getElementById(id).doCommand();
            }, 250);
        }
        else
        {
            document.getElementById(id).doCommand();
        }
    }
};
