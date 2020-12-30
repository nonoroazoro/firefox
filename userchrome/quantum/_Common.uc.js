// ==UserScript==
// @name           _Common.uc.js
// @description    Common library for UserChrome.js.
// @charset        UTF-8
// @history        2020-12-30  Added support for Firefox 84.
// ==/UserScript==

const Common = {
    copy(str)
    {
        Components.classes["@mozilla.org/widget/clipboardhelper;1"]
            .getService(Components.interfaces.nsIClipboardHelper)
            .copyString(str);
    },

    /**
     * Creates an HTML Element.
     */
    createElement(tagName, attributes)
    {
        const element = document.createElement(tagName);
        if (attributes)
        {
            Object.keys(attributes).forEach(key =>
            {
                element.setAttribute(key, attributes[key])
            });
        }
        return element;
    },

    /**
     * Creates an XUL element.
     */
    createXULElement(localName, attributes)
    {
        const element = document.createXULElement(localName);
        if (attributes)
        {
            Object.keys(attributes).forEach(key =>
            {
                element.setAttribute(key, attributes[key])
            });
        }
        return element;
    },

    /**
     * Launch program.
     */
    launch(filename)
    {
        FileUtils.getFile("UChrm", ["program", filename]).launch();
    },

    /**
     * Open URL in new Tab.
     *
     * See https://github.com/alice0775/userChrome.js/blob/master/MouseGestures2_e10s.uc.js
     */
    openURL(url, inBackground = false)
    {
        openTrustedLinkIn(url, "tab", { inBackground });
    },

    toast(message, title = "UserChrome.js")
    {
        Components.classes["@mozilla.org/alerts-service;1"]
            .getService(Components.interfaces.nsIAlertsService)
            .showAlertNotification("", title, message, false, "", null);
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
    },

    /**
     * Gets Firefox preference.
     *
     * @param {string} name Preference name.
     * @param {any} type Preference type.
     * @param {any} defaultValue Preference default value.
     */
    getPreference(name, type, defaultValue)
    {
        try
        {
            switch (type)
            {
                case "complex":
                    return Services.prefs.getComplexValue(name, Components.interfaces.nsIFile);

                case "str":
                    return unescape(Services.prefs.getCharPref(name).toString());

                case "int":
                    return Services.prefs.getIntPref(name);

                case "bool":
                default:
                    return Services.prefs.getBoolPref(name);
            }
        } catch { }
        return defaultValue;
    },

    /**
     * Sets Firefox preference.
     *
     * @param {string} name Preference name.
     * @param {any} type Preference type.
     * @param {any} defaultValue Preference default value.
     */
    setPreference(name, type, defaultValue)
    {
        try
        {
            switch (type)
            {
                case "complex":
                    return Services.prefs.setComplexValue(name, Components.interfaces.nsIFile, defaultValue);

                case "str":
                    return Services.prefs.setCharPref(name, escape(defaultValue));

                case "int":
                    defaultValue = parseInt(defaultValue);
                    return Services.prefs.setIntPref(name, defaultValue);

                case "bool":
                default:
                    return Services.prefs.setBoolPref(name, defaultValue);
            }
        } catch { }
        return;
    },

    restartFirefox()
    {
        Components.classes["@mozilla.org/toolkit/app-startup;1"]
            .getService(Components.interfaces.nsIAppStartup)
            .quit(Components.interfaces.nsIAppStartup.eAttemptQuit | Components.interfaces.nsIAppStartup.eRestart);
    }
};
