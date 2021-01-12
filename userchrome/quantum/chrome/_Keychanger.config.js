return {
    // ******************************** Builtin ********************************
    // Select Left Tab.
    "1": "gBrowser.tabContainer.advanceSelectedTab(-1, true);",

    // Select Right Tab.
    "2": "gBrowser.tabContainer.advanceSelectedTab(1, true);",

    // Scroll Left.
    "A": `goDoCommand("cmd_scrollLeft");`,

    // Scroll Right.
    "D": `goDoCommand("cmd_scrollRight");`,

    // Scroll page Up.
    "W": `goDoCommand("cmd_scrollPageUp");`,

    // Scroll page Down.
    "S": `goDoCommand("cmd_scrollPageDown");`,

    // Reload skip cache.
    "R": "BrowserReloadSkipCache();",

    // Open InoReader.
    "F1": function ()
    {
        Common.openURL("https://www.inoreader.com");
    },

    // Open current page with google cache.
    "F2": function ()
    {
        const url = gBrowser.currentURI.spec;
        if (url !== "" && !url.startsWith("about:"))
        {
            Common.openURL(`https://www.google.com/search?q=cache:${encodeURIComponent(url)}`);
        }
    },

    /**
     * Translate selected text.
     */
    "F3": function ()
    {
        Common.evalInContent("content.document.getSelection().toString()", (data) =>
        {
            if (data === "")
            {
                Common.openURL("http://dict.youdao.com");
            }
            else
            {
                Common.openURL(`http://dict.youdao.com/search?q=${encodeURIComponent(data)}`);
            }
        });
    },

    /**
     * Translate selected text.
     */
    "Shift+F3": function ()
    {
        Common.evalInContent("content.document.getSelection().toString()", (data) =>
        {
            if (data === "")
            {
                Common.openURL("https://translate.google.com/?sl=auto&tl=zh-CN");
            }
            else
            {
                Common.openURL(`https://translate.google.com/?sl=auto&tl=zh-CN&text=${encodeURIComponent(data)}&op=translate`);
            }
        });
    },

    // Open about page
    "F4": function ()
    {
        Common.openURL("about:about");
    },

    // Open profiles Folder.
    "F9": function ()
    {
        FileUtils.getDir("ProfD", ["chrome"]).launch();
    },

    // Open addons manager.
    "Alt+A": "BrowserOpenAddonsMgr();",

    // Open bookmark search plus.
    // "Alt+B": `PlacesCommandHook.showPlacesOrganizer("AllBookmarks");`,

    // Copy page url.
    "Alt+C": function ()
    {
        Common.copy(gBrowser.currentURI.spec);
    },

    // Focus url bar and select all.
    "Alt+D": function ()
    {
        gURLBar.focus();
        document.getElementById("urlbar-input").select();
    },

    // Clear history.
    "Alt+Delete": function ()
    {
        Common.doCommand("sanitizeItem");
    },

    // Open history manager.
    "Alt+H": `PlacesCommandHook.showPlacesOrganizer("History");`,

    // Open home page.
    "Alt+Home": "BrowserHome();",

    // Open reader mode.
    // "Alt+K": "ReaderParent.toggleReaderMode(event);",

    // Go back.
    "Alt+Left": "BrowserBack()",

    // Go forward.
    "Alt+Right": "BrowserForward()",

    // Open firefox color picker.
    "Alt+P": function ()
    {
        Common.doCommand("menu_eyedropper");
    },

    // Browse page info.
    "Alt+U": "BrowserPageInfo();",

    // Undo closed Tab.
    "Alt+Z": "undoCloseTab();",

    // Open bookmarks.
    "Ctrl+B": `PlacesCommandHook.showPlacesOrganizer("AllBookmarks");`,

    // Inspect DOM elements.
    "Ctrl+E": function ()
    {
        Common.doCommand("menuitem_inspector");
    },

    // Create a new tab.
    "Ctrl+N": function ()
    {
        // BrowserOpenTab();
        Common.openURL("about:newtab");
    },

    // Toggle mute and disable Mac's stupid minimize app shortcut.
    "Ctrl+M": function ()
    {
        gBrowser.selectedTab.toggleMuteAudio();
    },

    // Open preferences.
    "Ctrl+P": "openPreferences();",

    // Close tab.
    "Ctrl+W": "BrowserCloseTabOrWindow();",

    // Restart Firefox.
    "Ctrl+Alt+R": function ()
    {
        Common.restartFirefox();
    },

    // ****************************** UserChrome.js ******************************
    // NetEase Music Global Hotkey.
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

    // NetEase Music Global Hotkey.
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
    // Open RESTer.
    "F8": function ()
    {
        Common.openURL("moz-extension://8f6f7d5a-3885-3841-a4c5-34b8ff25dd23/site/index.html");
    },

    // Convert to Simplified Chinese.
    // "Alt+J": function ()
    // {
    //     Common.doCommand("tongwen_softcup-browser-action", true);
    // },

    // Convert to Traditional Chinese.
    // "Ctrl+Alt+J": function ()
    // {
    //     TongWen.trans(TongWen.TRAFLAG);
    // },

    // Show QR code.
    // "Alt+Q": function (e)
    // {
    //     Common.doCommand("tinyqrcode_nonoroazoro_com-browser-action");
    // },

    // Open Net Video Hunter.
    // "Alt+N": "com.netvideohunter.downloader.Overlay_Instance.openMediaListWindow();",

    // Switch proxy mode.
    "X": function ()
    {
        Common.doCommand("switchyomega_feliscatus_addons_mozilla_org-browser-action");
    },

    // Copy all download links fro Thunder.
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

    // Save page to file.
    // "Alt+S": function (e)
    // {
    //     Common.doCommand("_531906d3-e22f-4a6c-a102-8057b88a1a63_-browser-action", true);
    // }
};
