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
            Common.openURL(`https://www.google.com/search?q=cache:${encodeURIComponent(url)}`);
        }
    },

    /**
     * Translates selected text.
     */
    "F3": function ()
    {
        Common.evalInContent(`content.document.getSelection().toString()`, (data) =>
        {
            if (data === "")
            {
                Common.openURL(`http://dict.youdao.com`);
            }
            else
            {
                Common.openURL(`http://dict.youdao.com/search?q=${encodeURIComponent(data)}`);
            }
        });
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

    // Copy page URL
    "Alt+C": function ()
    {
        Common.copy(gBrowser.currentURI.spec);
    },

    // Focus URL bar
    "Alt+D": "gURLBar.focus();",

    // Clear History
    "Alt+Delete": function ()
    {
        Common.doCommand("sanitizeItem");
    },

    // History
    "Alt+H": `PlacesCommandHook.showPlacesOrganizer("History");`,

    // Home Page
    "Alt+Home": "BrowserHome();",

    // Reader Mode
    // "Alt+K": "ReaderParent.toggleReaderMode(event);",

    // Back
    "Alt+Left": "BrowserBack()",

    // Forward
    "Alt+Right": "BrowserForward()",

    // Firefox Color Picker
    "Alt+P": function ()
    {
        Common.doCommand("menu_eyedropper");
    },

    // Browse page info
    "Alt+U": "BrowserPageInfo();",

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

    // Toggle mute and disable Mac's stupid Minimize shortcut
    "Ctrl+M": function ()
    {
        gBrowser.selectedTab.toggleMuteAudio();
    },

    // Preferences
    "Ctrl+P": "openPreferences();",

    // Close Tab
    "Ctrl+W": "BrowserCloseTabOrWindow();",

    // Restart Firefox
    "Ctrl+Alt+R": function ()
    {
        Common.restartFirefox();
    },

    // ****************************** UserChrome.js ******************************
    // NetEase Music Global Hotkey
    // "Ctrl+Alt+Left": function (e)
    // {
    //     // 感谢黑仪大螃蟹。
    //     if (gBrowser.selectedBrowser.documentURI.asciiHost !== "music.163.com")
    //     {
    //         let browser = null;
    //         const length = gBrowser.browsers.length;
    //         for (let i = 0; i < length; i++)
    //         {
    //             browser = gBrowser.browsers[i];
    //             if (browser.documentURI.asciiHost === "music.163.com")
    //             {
    //                 const button = browser.contentDocument.querySelector(".prv");
    //                 button && button.click();
    //                 break;
    //             }
    //         }
    //     }
    // },

    // NetEase Music Global Hotkey
    // "Ctrl+Alt+Right": function (e)
    // {
    //     // 感谢黑仪大螃蟹。
    //     if (gBrowser.selectedBrowser.documentURI.asciiHost != "music.163.com")
    //     {
    //         let browser = null;
    //         const length = gBrowser.browsers.length;
    //         for (let i = 0; i < length; i++)
    //         {
    //             browser = gBrowser.browsers[i];
    //             if (browser.documentURI.asciiHost === "music.163.com")
    //             {
    //                 const button = browser.contentDocument.querySelector(".nxt");
    //                 button && button.click();
    //                 break;
    //             }
    //         }
    //     }
    // },

    // ******************************** Addons ********************************
    // RESTer
    "F8": function ()
    {
        Common.openURL("moz-extension://8f6f7d5a-3885-3841-a4c5-34b8ff25dd23/site/index.html");
    },

    // Convert to Simplified Chinese
    // "Alt+J": function ()
    // {
    //     Common.doCommand("tongwen_softcup-browser-action", true);
    // },

    // Convert to Traditional Chinese
    // "Ctrl+Alt+J": function ()
    // {
    //     TongWen.trans(TongWen.TRAFLAG);
    // },

    // Show QR Code
    // "Alt+Q": function (e)
    // {
    //     Common.doCommand("tinyqrcode_nonoroazoro_com-browser-action");
    // },

    // Net Video Hunter
    "Alt+N": "com.netvideohunter.downloader.Overlay_Instance.openMediaListWindow();",

    // Switch Proxy Mode
    "X": function ()
    {
        Common.doCommand("switchyomega_feliscatus_addons_mozilla_org-browser-action");
    },

    // Copy all Thunder download links
    "Alt+M": function (e)
    {
        Common.evalInContent(
            () =>
            {
                const urls = [];
                urls.push(..._filterURLs(content.document.getElementsByTagName("a"), "href"));
                urls.push(..._filterURLs(content.document.getElementsByTagName("input"), "value"));
                urls.push(..._filterURLs(content.document.getElementsByTagName("textarea"), "value"));

                function _filterURLs(elements, key)
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

                return [...new Set(urls)].sort((a, b) => a.localeCompare(b)).join("\n");
            },
            (data) =>
            {
                Common.copy(data);
            }
        );
    },

    // Save page to file
    // "Alt+S": function (e)
    // {
    //     Common.doCommand("_531906d3-e22f-4a6c-a102-8057b88a1a63_-browser-action", true);
    // }
};
