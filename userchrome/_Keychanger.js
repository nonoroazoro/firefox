return {
    // ******************************** Native ********************************
    // Select Left Tab
    "1": "gBrowser.mTabContainer.advanceSelectedTab(-1, true);",

    // Select Right Tab
    "2": "gBrowser.mTabContainer.advanceSelectedTab(1, true);",

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

    // Dictionary
    "F3": function ()
    {
        let url = "http://dict.youdao.com";
        const select = getBrowserSelection().trim();
        if (select !== "")
        {
            url = `${url}/search?q=${encodeURI(select)}`;
        }
        openUILinkIn(url, "tab");
    },

    // Config Page
    "F4": function ()
    {
        openUILinkIn("about:about", "tab");
    },

    // RESTer
    "F6": function ()
    {
        openUILinkIn("moz-extension://275a1243-59b0-46cf-af42-1bd2d40d8a8e/site/index.html", "tab");
    },

    // Open Path of Exile Skill Tree.
    "F8": function ()
    {
        let url = "https://poe.game.qq.com/passive-skill-tree/";
        const select = getBrowserSelection().trim();
        if (select !== "")
        {
            url += select.substring(select.lastIndexOf("/") + 1);
        }
        openUILinkIn(url, "tab");
    },

    // Open Profiles Folder
    "F9": function ()
    {
        Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsILocalFile).launch();
    },

    // Addons
    "Alt+A": "BrowserOpenAddonsMgr();",

    // Focus URL bar
    "Alt+D": "gURLBar.focus();",

    // Clear History
    "Alt+Delete": `Cc["@mozilla.org/browser/browserglue;1"].getService(Ci.nsIBrowserGlue).sanitize(window);`,

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
    "Alt+K": function (e)
    {
        ReaderParent.toggleReaderMode(e);
    },

    // Undo Closed Tab
    "Alt+Z": "undoCloseTab();",

    // Bookmarks
    "Ctrl+B": `PlacesCommandHook.showPlacesOrganizer("AllBookmarks");`,

    // Inspect DOM Elements
    "Ctrl+E": `gDevToolsBrowser.selectToolCommand(gBrowser, "inspector");`,

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
        Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup).quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart);
    },

    // ****************************** UserChrome ******************************
    // Convert to Simplified Chinese
    "Alt+J": function ()
    {
        TongWen.trans(TongWen.SIMFLAG);
    },

    // Convert to Traditional Chinese
    "Ctrl+Alt+J": function ()
    {
        TongWen.trans(TongWen.TRAFLAG);
    },

    // Net Video Hunter
    "Alt+N": "com.netvideohunter.downloader.Overlay_Instance.openMediaListWindow();",

    // Show QR Code.
    "Alt+Q": function (e)
    {
        document.getElementById("tinyqrcode_nonoroazoro_com-browser-action").doCommand();
    },

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
    // Switch Proxy Mode
    "X": function ()
    {
        document.getElementById("aup-toolbarbutton").click();
    },

    // FireIE Switch Engine
    "Alt+C": "gFireIE.switchEngine();",

    // LastPass Save Form
    "Alt+1": "LP.lpOpenEditWindow(0, false, false, null, true);",


    // LastPass Generate Password
    "Alt+G": "LP.lpOpenGenPWWindow();",

    // LastPass Search Sites
    "Alt+W": "LP.lpOpenSearch();",

    // Unused
    "Alt+M": function (e)
    {
        ThunderPlus.copy();
    },

    // Pocket Toggle
    "Alt+R": "RIL.hotKeyToggle();",

    // Xmarks Sync Bookmarks
    "Ctrl+Shift+S": "Xmarks.Synch();",
};
