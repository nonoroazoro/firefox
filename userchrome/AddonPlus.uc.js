// ==UserScript==
// @name           AddonPlus.uc.js
// @description    附加组件增强。
// @charset        UTF-8
// @version        1.0
// @include        about:addons
// @include        chrome://mozapps/content/extensions/extensions.xul
// ==/UserScript==

let addonPlus = {
    _items: [
        {
            name: "menuitem",
            params:
            {
                id: "utils-addonPlus-enableAll",
                label: "启用所有附加组件",
                accesskey: "E",
                tooltipText: "启用所有附加组件",
                oncommand: "addonPlus.enableAll();"
            }
        },
        {
            name: "menuitem",
            params:
            {
                id: "utils-addonPlus-disableAll",
                label: "禁用所有附加组件",
                accesskey: "D",
                tooltipText: "禁用所有附加组件",
                oncommand: "addonPlus.disableAll();"
            }
        },
        {
            name: "menuseparator",
            params:
            {
                id: "utils-addonPlus-separator"
            }
        }],

    _menuItems: null,
    get menuItems()
    {
        if (!this._menuItems)
        {
            let item;
            this._menuItems = [];
            for (let i = 0; i < this._items.length; i++)
            {
                item = this._items[i];
                this._menuItems.push(Utils.create(item.name, item.params));
            }
        }
        return this._menuItems;
    },

    init: function ()
    {
        document.addEventListener("DOMContentLoaded", function (e)
        {
            let doc = e.target;
            if (["about:addons", "chrome://mozapps/content/extensions/extensions.xul"].indexOf(doc.URL) != -1)
            {
                doc.defaultView.addonPlus = addonPlus;
                addonPlus.initAddonList();
                addonPlus.initMenu(doc.getElementById("utils-menu"));
            }
        });
    },

    initMenu: function (p_menu)
    {
        if (p_menu)
        {
            for (let i = this.menuItems.length - 1; i >= 0; i--)
            {
                p_menu.insertBefore(this.menuItems[i], p_menu.firstChild);
            }
        }
    },

    initAddonList: function ()
    {
        let that = this;
        AddonManager.getAddonsByTypes(["extension"], function (p_list)
        {
            that.addons = Array.slice(p_list);
        });

        while (that.addons == void (0))
        {
            Services.tm.mainThread.processNextEvent(true);
        }
    },

    enableAll: function ()
    {
        for (let i = 1; i < this.addons.length; i++)
        {
            this.addons[i].userDisabled = false;
        }
    },

    disableAll: function ()
    {
        for (let i = 1; i < this.addons.length; i++)
        {
            this.addons[i].userDisabled = true;
        }
    },
};

addonPlus.init();
