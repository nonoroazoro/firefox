return {
    // ******************************** Builtin ********************************
    // Select Left Tab
    "1": "gBrowser.tabContainer.advanceSelectedTab(-1, true);",

    // Select Right Tab
    "2": "gBrowser.tabContainer.advanceSelectedTab(1, true);",

    // Scroll Left
    "A": `goDoCommand("cmd_scrollLeft");`,

    // Scroll Right
    "D": `goDoCommand("cmd_scrollRight");`,

    // Page Up
    "W": `goDoCommand("cmd_scrollPageUp");`,

    // Page Down
    "S": `goDoCommand("cmd_scrollPageDown");`,

    // Reload Skip Cache
    "R": "BrowserReloadSkipCache();",

    // Open InoReader
    "F1": function ()
    {
        Common.openURL("https://www.inoreader.com");
    },

    // Open Google Cache of Current Page
    "F2": function ()
    {
        const url = gBrowser.currentURI.spec;
        if (url !== "" && !url.startsWith("about:"))
        {
            Common.openURL(`https://www.google.com/search?q=cache:${url}`);
        }
    },

    // Open About Page
    "F4": function ()
    {
        Common.openURL("about:about");
    },

    // Open Profiles Folder
    "F9": function ()
    {
        FileUtils.getDir("ProfD", []).launch();
    },

    // Addons
    "Alt+A": "BrowserOpenAddonsMgr();",

    // Focus URL bar
    "Alt+D": "gURLBar.focus();",

    // Clear History
    "Alt+Delete": function ()
    {
        Common.doCommand("sanitizeItem");
    },

    // Home Page
    "Alt+Home": "BrowserHome();",

    // Back
    "Alt+Left": "BrowserBack()",

    // Forward
    "Alt+Right": "BrowserForward()",

    // Firefox Color Picker
    "Alt+P": function ()
    {
        Common.doCommand("menu_eyedropper");
    },

    // Reader Mode
    // "Alt+K": "ReaderParent.toggleReaderMode(event);",

    // Undo Closed Tab
    "Alt+Z": "undoCloseTab();",

    // Bookmarks
    "Ctrl+B": `PlacesCommandHook.showPlacesOrganizer("AllBookmarks");`,

    // Inspect DOM Elements
    "Ctrl+E": function ()
    {
        Common.doCommand("menuitem_inspector");
    },

    // New Tab
    "Ctrl+N": "BrowserOpenTab();",

    // Preferences
    "Ctrl+P": "openPreferences();",

    // Close Tab
    "Ctrl+W": "BrowserCloseTabOrWindow();",

    // Restart Firefox
    "Ctrl+Alt+R": function ()
    {
        // "Services.appinfo.invalidateCachesOnRestart() || Application.restart();"
        const XRE = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime);
        if (typeof XRE.invalidateCachesOnRestart == "function")
        {
            XRE.invalidateCachesOnRestart();
        }
        Components.classes["@mozilla.org/toolkit/app-startup;1"]
            .getService(Components.interfaces.nsIAppStartup)
            .quit(Components.interfaces.nsIAppStartup.eAttemptQuit | Components.interfaces.nsIAppStartup.eRestart);
    },

    // ****************************** UserChrome.js ******************************
    // NetEase Music Global Hotkey
    "Ctrl+Alt+Left": function (e)
    {
        // 感谢黑仪大螃蟹。
        if (gBrowser.selectedBrowser.documentURI.asciiHost !== "music.163.com")
        {
            let browser = null;
            const length = gBrowser.browsers.length;
            for (let i = 0; i < length; i++)
            {
                browser = gBrowser.browsers[i];
                if (browser.documentURI.asciiHost === "music.163.com")
                {
                    const button = browser.contentDocument.querySelector(".prv");
                    button && button.click();
                    break;
                }
            }
        }
    },

    // NetEase Music Global Hotkey
    "Ctrl+Alt+Right": function (e)
    {
        // 感谢黑仪大螃蟹。
        if (gBrowser.selectedBrowser.documentURI.asciiHost != "music.163.com")
        {
            let browser = null;
            const length = gBrowser.browsers.length;
            for (let i = 0; i < length; i++)
            {
                browser = gBrowser.browsers[i];
                if (browser.documentURI.asciiHost === "music.163.com")
                {
                    const button = browser.contentDocument.querySelector(".nxt");
                    button && button.click();
                    break;
                }
            }
        }
    },

    // ******************************** Addons ********************************
    // RESTer
    "F8": function ()
    {
        Common.openURL("moz-extension://c449bbe8-33ff-c940-9840-c306167e216b/site/index.html");
    },

    // Convert to Simplified Chinese
    "Alt+J": function ()
    {
        Common.doCommand("tongwen_softcup-browser-action", true);
    },

    // Convert to Traditional Chinese
    "Ctrl+Alt+J": function ()
    {
        TongWen.trans(TongWen.TRAFLAG);
    },

    // Net Video Hunter
    "Alt+N": "com.netvideohunter.downloader.Overlay_Instance.openMediaListWindow();",

    // Show QR Code
    "Alt+Q": function (e)
    {
        Common.doCommand("tinyqrcode_nonoroazoro_com-browser-action");
    },

    // Switch Proxy Mode
    "X": function ()
    {
        Common.doCommand("switchyomega_feliscatus_addons_mozilla_org-browser-action");
    },

    // Copy all Thunder download links
    "Alt+M": function (e)
    {
        ThunderPlus.copy();
    },

    // Save page to file
    "Alt+S": function (e)
    {
        Common.doCommand("_531906d3-e22f-4a6c-a102-8057b88a1a63_-browser-action", true);
    }
};
