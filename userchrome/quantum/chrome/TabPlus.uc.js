// ==UserScript==
// @name           TabPlus.uc.js
// @description    Enhance the Tabs.
// @charset        UTF-8
// @history        2020-12-30  Added support for Firefox 84.
// @homepageURL    https://github.com/nonoroazoro/firefox/tree/master/userchrome/quantum
// @include        chrome://browser/content/browser.xhtml
// @include        chrome://browser/content/browser.xul
// ==/UserScript==

const TabPlus = {
    init()
    {
        // this.openBookmarksInNewTab();
        // this.openLocationsInNewTab();
        this.doubleClickCloseTab();
        this.newTabRight();
        this.openLeftTabAfterClose();
        this.viewImageInNewTab();
    },

    /*
     * Open in new Tab: Bookmarks.
     */
    openBookmarksInNewTab()
    {
        try
        {
            let newFunc = openLinkIn.toString().replace(`w.gBrowser.getTabForBrowser(targetBrowser).pinned`, `true`);

            // Open in current tab when the uri is same.
            newFunc = newFunc.replace(
                "targetBrowser.currentURI.host != uriObj.host",
                "targetBrowser.currentURI.spec != uriObj.spec"
            );

            eval("openLinkIn = " + newFunc);
        }
        catch (e)
        { }
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
        }
        catch (e)
        { }
    },

    /*
     * Double click to close tab.
     */
    doubleClickCloseTab()
    {
        gBrowser.tabContainer.addEventListener("dblclick", (e) =>
        {
            if (e.button == 0 & !e.ctrlKey)
            {
                const tab = e.target.closest(".tabbrowser-tab");
                if (tab)
                {
                    gBrowser.removeTab(tab, { animate: true });
                }
            }
        });
    },

    /*
     * View image in new tab.
     */
    viewImageInNewTab()
    {
        document.getElementById("context-viewimage")
            .setAttribute("oncommand", `openTrustedLinkIn(gContextMenu.imageURL, "tab")`);
    },

    /*
     * Create new Tabs on the right of the current Tab.
     *
     */
    newTabRight()
    {
        gBrowser.tabContainer.addEventListener("TabOpen", (e) =>
        {
            gBrowser.moveTabTo(e.target, gBrowser.tabContainer.selectedIndex + 1);
        });
    },

    /*
     * Open left tab after closing current tab.
     */
    openLeftTabAfterClose()
    {
        gBrowser.tabContainer.addEventListener("TabClose", (e) =>
        {
            const leftTab = e.target.previousSibling;
            if (leftTab)
            {
                gBrowser.selectedTab = leftTab;
            }
        });
    }
};

TabPlus.init();
