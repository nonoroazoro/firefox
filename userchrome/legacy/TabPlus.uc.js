// ==UserScript==
// @name           TabPlus.uc.js
// @namespace      https://github.com/nonoroazoro
// @description    标签页增强。
// @charset        UTF-8
// @version        1.0
// ==/UserScript==

const tabPlus = {
    init: function ()
    {
        if (location.href == "chrome://browser/content/browser.xul")
        {
            this.openBookmarksInNewTab();
            this.openLocationsInNewTab();
            this.dblClickCloseTab();
            this.openLeftTabAfterClose();
        }
    },

    /*
     * @description 在新标签页中打开：书签。
     */
    openBookmarksInNewTab: function ()
    {
        try
        {
            let newFunc = openLinkIn.toString();
            newFunc = newFunc.replace("tab.pinned", "!w.isTabEmpty(tab)");
            newFunc = newFunc.replace(/&&\n.+uriObj\.host/, "");
            eval("openLinkIn = " + newFunc);
        }
        catch (e)
        { }
    },

    /*
     * @description 在新标签页中打开：搜索栏。
     */
    openLocationsInNewTab: function ()
    {
        try
        {
            let newFunc = gURLBar.handleCommand.toString();

            // ignore alt + enter.
            newFunc = newFunc.replace(/&&\n.+altKey &&/, "&&");

            // open in current tab when uri is not changed.
            newFunc = newFunc.replace("!isTabEmpty(gBrowser.selectedTab);", "!isTabEmpty(gBrowser.selectedTab) && (encodeURI(this.value) !== gBrowser.selectedBrowser.lastURI.spec);");
            eval("gURLBar.handleCommand = " + newFunc);
        }
        catch (e)
        { }
    },

    /*
     * @description 左键双击关闭标签页。
     */
    dblClickCloseTab: function ()
    {
        gBrowser.mTabContainer.addEventListener(
            "dblclick",
            function (e)
            {
                if (e.target.localName == "tab" && e.button == 0)
                {
                    e.preventDefault();
                    gBrowser.removeTab(e.target);
                    e.stopPropagation();
                }
            },
            false
        );
    },

    /*
     * @description 在当前标签页右侧新建标签页。
     */
    newTabRight: function ()
    {
        gBrowser.tabContainer.addEventListener(
            "TabOpen",
            function (e)
            {
                gBrowser.moveTabTo(e.target, gBrowser.mCurrentTab._tPos + 1);
            },
            false
        );
    },

    /*
     * @description 关闭标签页后打开左侧标签页。
     */
    openLeftTabAfterClose: function ()
    {
        gBrowser.mTabContainer.addEventListener(
            "TabClose",
            function (e)
            {
                var tab = e.target;
                if (tab._tPos <= gBrowser.mTabContainer.selectedIndex)
                {
                    if (tab.previousSibling)
                    {
                        gBrowser.mTabContainer.selectedIndex--;
                    }
                }
            },
            false
        );
    },
};

tabPlus.init();
