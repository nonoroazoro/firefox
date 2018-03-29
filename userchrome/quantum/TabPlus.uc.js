// ==UserScript==
// @name           TabPlus.uc.js
// @namespace      https://github.com/nonoroazoro
// @description    Enhance the Tabs.
// @charset        UTF-8
// @version        1.0  2018-03-20  Added support for Firefox Quantum.
// ==/UserScript==

const TabPlus = {
    init: function ()
    {
        if (location.href == "chrome://browser/content/browser.xul")
        {
            this.openLinkInString = openLinkIn.toString();
            this.gURLBarHandleCommandString = gURLBar.handleCommand.toString();

            // this.openBookmarksInNewTab();
            this.openLocationsInNewTab();
            this.dblClickCloseTab();
            this.openLeftTabAfterClose();
            this.newTabRight();
        }
    },

    /*
     * Open in new Tab: Bookmarks.
     */
    openBookmarksInNewTab: function ()
    {
        try
        {
            let newFunc = this.openLinkInString.replace(`w.gBrowser.getTabForBrowser(targetBrowser).pinned`, `true`);

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
    openLocationsInNewTab: function ()
    {
        try
        {
            // Ignore Alt + Enter.
            let newFunc = this.gURLBarHandleCommandString.replace(/&&\n.+altKey &&/, "&&");

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
     * Double click to close Tab.
     */
    dblClickCloseTab: function ()
    {
        gBrowser.tabContainer.addEventListener("dblclick", (e) =>
        {
            if (e.target.localName == "tab" && e.button == 0)
            {
                gBrowser.removeTab(e.target, { animate: true });
            }
        });
    },

    /*
     * Create new Tabs on the right of the current Tab.
     *
     */
    newTabRight: function ()
    {
        gBrowser.tabContainer.addEventListener("TabOpen", (e) =>
        {
            gBrowser.moveTabTo(e.target, gBrowser.mCurrentTab._tPos + 1);
        });
    },

    /*
     * Open the left Tab when the current Tab is closed.
     */
    openLeftTabAfterClose: function ()
    {
        gBrowser.tabContainer.addEventListener("TabClose", (e) =>
        {
            const leftTab = e.target.previousSibling;
            if (leftTab)
            {
                gBrowser.selectedTab = leftTab;
            }
        });
    },
};

TabPlus.init();
