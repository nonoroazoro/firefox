// ==UserScript==
// @name           _Common.uc.js
// @description    Common library for UserChrome.js.
// @charset        UTF-8
// @history        2020-12-30  Added support for Firefox 84.
// @homepageURL    https://github.com/nonoroazoro/firefox/tree/master/userchrome/quantum
// ==/UserScript==

const Common = {
    /**
     * Gets Firefox IOService.
     */
    get IOService()
    {
        return Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    },

    /**
     * Gets Firefox StyleSheetService.
     */
    get StyleSheetService()
    {
        return Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
    },

    /**
     * Gets Firefox ClipboardService.
     */
    get ClipboardService()
    {
        return Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
    },

    /**
     * Copies string to clipboard.
     */
    copy(str)
    {
        this.ClipboardService.copyString(str);
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
     * Creates a widget.
     */
    createWidget(id, label, tooltiptext, defaultArea, onCreated)
    {
        CustomizableUI.createWidget({
            defaultArea,
            id,
            label,
            tooltiptext,
            onCreated
        });
    },

    /**
     * Eval expression in current content document, return the expression result as the data param of the callback.
     *
     * @param {string | () => any} expression
     * @param {(data: any) => void} callback
     */
    evalInContent(expression, callback)
    {
        const eventId = Math.random().toString(36).substr(1, 9);
        const messageManager = gBrowser.selectedBrowser.messageManager;
        messageManager.addMessageListener(eventId, _handler);
        function _handler(message)
        {
            messageManager.removeMessageListener(eventId, _handler, true);
            if (callback)
            {
                callback(message.data);
            }
        }
        const script = encodeURIComponent(typeof expression === "function" ? "(" + expression.toString() + ")()" : expression);
        messageManager.loadFrameScript(`data:application/javascript;charset=utf-8,sendAsyncMessage("${eventId}", ${script})`, false);
    },

    /**
     * Loads CSS.
     *
     * @param {string} cssStr CSS string.
     */
    loadCSS(cssStr)
    {
        this.StyleSheetService.loadAndRegisterSheet(
            this.IOService.newURI("data:text/css;base64," + btoa(cssStr), null, null),
            this.StyleSheetService.USER_SHEET
        );
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
        openTrustedLinkIn(url, "tab", { inBackground, relatedToCurrent: true });
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

    getSelectedText()
    {
        return BrowserUtils.getSelectionDetails(content).fullText;
    },

    restartFirefox()
    {
        Services.startup.quit(Services.startup.eAttemptQuit | Services.startup.eRestart);

        // Components.classes["@mozilla.org/toolkit/app-startup;1"]
        //     .getService(Components.interfaces.nsIAppStartup)
        //     .quit(Components.interfaces.nsIAppStartup.eAttemptQuit | Components.interfaces.nsIAppStartup.eRestart);
    },

    /**
     * Registers a plugin that has implemented the `activate` and `deactivate` methods.
     */
    register(plugin)
    {
        // plugin: { activate, deactivate }
        if (typeof plugin.activate === "function")
        {
            function _handleUnload()
            {
                plugin.deactivate();
                window.removeEventListener("unload", _handleUnload);
            };

            function start()
            {
                // Activate when the Firefox window has finished starting up.
                plugin.activate();
                if (typeof plugin.deactivate === "function")
                {
                    // Deactivate when the Firefox window has closed.
                    window.addEventListener("unload", _handleUnload);
                }
            }

            // Register when the browser window has finished starting up.
            if (gBrowserInit.delayedStartupFinished)
            {
                start();
            }
            else
            {
                const handleDelayedStartupFinished = (subject, topic) =>
                {
                    if (
                        topic == "browser-delayed-startup-finished"
                        && subject == window
                    )
                    {
                        Services.obs.removeObserver(handleDelayedStartupFinished, topic);
                        start();
                    }
                };
                Services.obs.addObserver(handleDelayedStartupFinished, "browser-delayed-startup-finished");
            }
        }
    }
};
