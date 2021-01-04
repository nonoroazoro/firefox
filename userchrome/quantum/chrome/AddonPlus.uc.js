// ==UserScript==
// @name           AddonPlus.uc.js
// @description    Enhance the addons manager, now you can toggle the addons by one key.
// @charset        UTF-8
// @version        1.0  2018-03-20  Added support for Firefox Quantum.
// @include        about:addons
// ==/UserScript==

const AddonPlus = {
    items: [
        {
            name: "menuitem",
            params: {
                id: "utils-addonPlus-enableAll",
                label: "启用所有附加组件(E)",
                accesskey: "E",
                tooltipText: "启用所有附加组件",
                oncommand: "AddonPlus.operate(false);"
            }
        },
        {
            name: "menuitem",
            params: {
                id: "utils-addonPlus-disableAll",
                label: "禁用所有附加组件(D)",
                accesskey: "D",
                tooltipText: "禁用所有附加组件",
                oncommand: "AddonPlus.operate(true);"
            }
        },
        {
            name: "menuseparator",
            params: { id: "utils-addonPlus-separator" }
        }
    ],

    prepareMenuItems(items)
    {
        return items.map((item) =>
        {
            return Common.create(item.name, item.params);
        });
    },

    prepareAddons()
    {
        return new Promise((resolve) =>
        {
            AddonManager.getAddonsByTypes(["extension"], resolve);
        });
    },

    initMenu(parent)
    {
        const items = this.prepareMenuItems(this.items);
        if (parent)
        {
            for (let i = items.length - 1; i >= 0; i--)
            {
                parent.insertBefore(items[i], parent.firstChild);
            }
        }
    },

    init()
    {
        document.addEventListener("DOMContentLoaded", (e) =>
        {
            const doc = e.target;
            if (doc.URL === "about:addons")
            {
                doc.defaultView.AddonPlus = this;
                this.initMenu(doc.getElementById("utils-menu"));
            }
        });
    },

    operate(disabled)
    {
        this.prepareAddons().then((addons) =>
        {
            addons.forEach(addon =>
            {
                // Only operate non-builtin addons.
                if (addon.creator)
                {
                    addon.userDisabled = disabled;
                }
            });
        });
    }
};

AddonPlus.init();
