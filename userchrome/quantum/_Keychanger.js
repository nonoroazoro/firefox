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

    // InoReader
    "F1": function ()
    {
        // gBrowser.selectedTab = gBrowser.addTab("https://www.inoreader.com");
        openUILinkIn("https://www.inoreader.com", "tab");
    },

    // Google Cache of Current Page
    "F2": function ()
    {
        const url = gBrowser.selectedBrowser.documentURI.spec;
        if (url !== "" && !url.startsWith("about:"))
        {
            openUILinkIn(`https://www.google.com/search?q=cache:${encodeURI(url)}`, "tab");
        }
    },

    // Config Page
    "F4": function ()
    {
        openUILinkIn("about:about", "tab");
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
    "Alt+Delete": `Components.classes["@mozilla.org/browser/browserglue;1"].getService(Components.interfaces.nsIBrowserGlue).sanitize(window);`,

    // Home Page
    "Alt+Home": "BrowserHome();",

    // Back
    "Alt+Left": "BrowserBack()",

    // Forward
    "Alt+Right": "BrowserForward()",

    // Firefox Color Picker
    "Alt+P": function ()
    {
        document.getElementById("menu_eyedropper").doCommand();
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
        document.getElementById("menuitem_inspector").doCommand();
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
    "F6": function ()
    {
        openUILinkIn("moz-extension://dd361e60-ba04-b943-a334-cb33a505edfd/site/index.html", "tab");
    },

    // Convert to Simplified Chinese
    "Alt+J": function ()
    {
        document.getElementById("tongwen_softcup-browser-action").doCommand();
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
        document.getElementById("tinyqrcode_nonoroazoro_com-browser-action").doCommand();
    },

    // Switch Proxy Mode
    "X": function ()
    {
        document.getElementById("switchyomega_feliscatus_addons_mozilla_org-browser-action").doCommand();
    },

    // Copy all Thunder download links
    "Alt+M": function (e)
    {
        ThunderPlus.copy();
    }
};
