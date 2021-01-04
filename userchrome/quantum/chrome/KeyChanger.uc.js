// ==UserScript==
// @name           KeyChanger.uc.js
// @description    Add custom keybindings to Firefox.
// @charset        UTF-8
// @history        2020-12-30  Added support for Firefox 84.
// @homepageURL    https://github.com/nonoroazoro/firefox/tree/master/userchrome/quantum
// ==/UserScript==

const KeyChanger = {
    register()
    {
        const keys = this.makeKeys();
        if (keys)
        {
            // Remove old keychanger-keyset.
            let keyset = document.getElementById("keychanger-keyset");
            if (keyset)
            {
                keyset.parentNode.removeChild(keyset);
            }

            // Backup Firefox default keys.
            const fragment = document.createDocumentFragment();
            for (let k of document.getElementsByTagName("keyset"))
            {
                fragment.appendChild(k);
            }

            // Prepare custom keys.
            keyset = Common.createXULElement("keyset", { id: "keychanger-keyset" });
            keyset.appendChild(keys);

            // Insert default and custom keys.
            const container = document.getElementById("mainPopupSet").parentNode;
            container.prepend(keyset, fragment);
        }
    },

    makeKeys()
    {
        const config = this.loadText(FileUtils.getFile("UChrm", ["_Keychanger.config.js"], false));
        if (!config)
        {
            return null;
        }

        const sandbox = new Components.utils.Sandbox(new XPCNativeWrapper(window));
        const keys = Components.utils.evalInSandbox("(function () {" + config + "})()", sandbox);
        if (!keys)
        {
            return null;
        }

        const fragment = document.createDocumentFragment();
        Object.keys(keys).forEach(n =>
        {
            let keyString = n.toUpperCase().split("+");
            let modifiers = "";
            let k;
            let key;
            let keycode;

            for (let i = 0, l = keyString.length; i < l; i++)
            {
                k = keyString[i];
                switch (k)
                {
                    case "CTRL":
                    case "CONTROL":
                    case "ACCEL":
                        modifiers += "accel,";
                        break;

                    case "SHIFT":
                        modifiers += "shift,";
                        break;

                    case "ALT":
                    case "OPTION":
                        modifiers += "alt,";
                        break;

                    case "META":
                    case "COMMAND":
                        modifiers += "meta,";
                        break;

                    case "OS":
                    case "WIN":
                    case "WINDOWS":
                    case "HYPER":
                    case "SUPER":
                        modifiers += "os,";
                        break;

                    case "":
                        key = "+";
                        break;

                    case "BACKSPACE":
                    case "BKSP":
                    case "BS":
                        keycode = "VK_BACK";
                        break;

                    case "RET":
                    case "ENTER":
                        keycode = "VK_RETURN";
                        break;

                    case "ESC":
                        keycode = "VK_ESCAPE";
                        break;

                    case "PAGEUP":
                    case "PAGE UP":
                    case "PGUP":
                    case "PUP":
                        keycode = "VK_PAGE_UP";
                        break;

                    case "PAGEDOWN":
                    case "PAGE DOWN":
                    case "PGDN":
                    case "PDN":
                        keycode = "VK_PAGE_DOWN";
                        break;

                    case "TOP":
                        keycode = "VK_UP";
                        break;

                    case "BOTTOM":
                        keycode = "VK_DOWN";
                        break;

                    case "INS":
                        keycode = "VK_INSERT";
                        break;

                    case "DEL":
                        keycode = "VK_DELETE";
                        break;

                    default:
                        if (k.length === 1)
                        {
                            key = k;
                        }
                        else if (k.indexOf("VK_") === -1)
                        {
                            keycode = "VK_" + k;
                        }
                        else
                        {
                            keycode = k;
                        }
                        break;
                }
            }

            const elem = document.createXULElement("key");
            if (modifiers !== "")
            {
                elem.setAttribute("modifiers", modifiers.slice(0, -1));
            }
            if (key != null)
            {
                elem.setAttribute("key", key);
            }
            else if (keycode != null)
            {
                elem.setAttribute("keycode", keycode);
            }

            const cmd = keys[n];
            switch (typeof cmd)
            {
                case "function":
                    elem.setAttribute("oncommand", "(" + cmd.toString() + ").call(this, event);");
                    break;

                case "object":
                    Object.keys(cmd).forEach(function (a)
                    {
                        elem.setAttribute(a, cmd[a]);
                    }, this);
                    break;

                default:
                    elem.setAttribute("oncommand", cmd);
            }
            fragment.appendChild(elem);
        }, this);

        return fragment;
    },

    createMenu()
    {
        const container = document.getElementById("menu_preferences").parentNode;
        const separator = Common.createXULElement("menuseparator", { id: "keychanger-separator" });
        const menu = Common.createXULElement("menuitem", {
            label: "Reload KeyChanger",
            accesskey: "R",
            oncommand: "KeyChanger.register()"
        });;
        container.append(separator, menu);
    },

    loadText(configFile)
    {
        const fStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        const sStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
        fStream.init(configFile, -1, 0, 0);
        sStream.init(fStream);

        let data = sStream.read(sStream.available());
        try
        {
            data = decodeURIComponent(escape(data));
        } catch { }
        sStream.close();
        fStream.close();
        return data;
    }
};

KeyChanger.createMenu();
KeyChanger.register();
