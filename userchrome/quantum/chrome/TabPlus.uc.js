// ==UserScript==
// @name           TabPlus.uc.js
// @description    Enhance the Tabs.
// @charset        UTF-8
// @history        2025-10-09  Added support for Firefox 143.
// @history        2020-12-30  Added support for Firefox 84.
// @homepageURL    https://github.com/nonoroazoro/firefox/tree/master/userchrome/quantum
// @include        chrome://browser/content/browser.xhtml
// @include        chrome://browser/content/browser.xul
// ==/UserScript==

const TabPlus = {
    activate()
    {
        // Double click to close the tab.
        gBrowser.tabContainer.addEventListener("dblclick", this._handleTabDoubleClick);

        // Open left tab after the current tab is closed.
        gBrowser.tabContainer.addEventListener("TabClose", this._handleTabClose);

        this._viewImageInNewTab();
    },

    deactivate()
    {
        gBrowser.tabContainer.removeEventListener("dblclick", this._handleTabDoubleClick);
        gBrowser.tabContainer.removeEventListener("TabClose", this._handleTabClose);
    },

    /*
     * Open in new Tab: Location Bar.
     */
    openLocationsInNewTab()
    {
        try
        {
            // Ignore Alt + Enter.
            let newFunc = gURLBar.handleCommand.toString().replace(/&&\n.+altKey &&/, "&&");

            // Open in current tab when the uri is same.
            newFunc = newFunc.replace(
                "!isTabEmpty(gBrowser.selectedTab);",
                "!isTabEmpty(gBrowser.selectedTab) && (encodeURI(this.value) !== gBrowser.selectedBrowser.lastURI.spec);"
            );

            eval("gURLBar.handleCommand = " + newFunc);
        } catch { }
    },

    /*
     * View image in new tab.
     */
    _viewImageInNewTab()
    {
        document.getElementById("context-viewimage").addEventListener("command", () =>
        {
            openTrustedLinkIn(gContextMenu.imageURL, "tab");
        });
    },

    _handleTabDoubleClick(e)
    {
        if (e.button == 0 && !e.ctrlKey && !e.metaKey)
        {
            const tab = e.target.closest(".tabbrowser-tab");
            if (tab)
            {
                gBrowser.removeTab(tab, { animate: true });
            }
        }
    },

    _handleTabClose(e)
    {
        const leftTab = e.target.previousSibling;
        if (leftTab)
        {
            gBrowser.selectedTab = leftTab;
        }
    }
};

Common.register(TabPlus);
