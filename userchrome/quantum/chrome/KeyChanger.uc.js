// ==UserScript==
// @name           KeyChanger.uc.js
// @description    Add custom keybindings to Firefox.
// @charset        UTF-8
// @history        2025-10-09  Added support for Firefox 143.
// @history        2024-04-25  Added support for Firefox 125.
// @history        2020-12-30  Added support for Firefox 84.
// @homepageURL    https://github.com/nonoroazoro/firefox/tree/master/userchrome/quantum
// ==/UserScript==

const KeyChanger = {
    registerKeys()
    {
        const keysFragment = this._makeKeys();
        if (keysFragment)
        {
            // Remove old keychanger-keyset.
            let keyset = document.getElementById("keychanger-keyset");
            if (keyset)
            {
                keyset.parentNode.removeChild(keyset);
            }

            // Backup Firefox default keys.
            const firefoxKeysFragment = document.createDocumentFragment();
            for (let k of document.getElementsByTagName("keyset"))
            {
                firefoxKeysFragment.appendChild(k);
            }

            // Prepare custom keys.
            keyset = Common.createXULElement("keyset", { id: "keychanger-keyset" });
            keyset.appendChild(keysFragment);

            // Insert default and custom keys.
            const container = document.getElementById("mainPopupSet").parentNode;
            container.prepend(keyset, firefoxKeysFragment);
        }
    },

    registerMenu()
    {
        if (document.getElementById("keychanger-menu") == null)
        {
            const container = document.getElementById("menu_preferences").parentNode;
            const separator = Common.createXULElement("menuseparator", { id: "keychanger-separator" });
            const menu = Common.createXULElement("menuitem", { id: "keychanger-menu", label: "Reload KeyChanger", accesskey: "R" });
            menu.addEventListener("command", () => this.registerKeys());
            container.append(separator, menu);
        }
    },

    _makeKeys()
    {
        const path = PathUtils.join(PathUtils.profileDir, "chrome", "KeyChanger.config.js");
        const config = this._loadFile(new FileUtils.File(path)) ?? "return {};";

        const sandbox = new Components.utils.Sandbox(window, { sandboxPrototype: window, sameZoneAs: window, });
        const commands = Components.utils.evalInSandbox("(function () {" + config + "})()", sandbox);
        const commandKeys = Object.keys(commands);
        if (commandKeys.length === 0)
        {
            return;
        }

        const fragment = document.createDocumentFragment();
        commandKeys.forEach(commandKey =>
        {
            let modifiers = "";
            let k;
            let key;
            let keycode;

            const commandKeyStrings = commandKey.toUpperCase().split("+");
            for (let i = 0, l = commandKeyStrings.length; i < l; i++)
            {
                k = commandKeyStrings[i];
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

            const command = commands[commandKey];
            const commandType = typeof command;
            switch (commandType)
            {
                case "function":
                    elem.addEventListener("command", Components.utils.evalInSandbox("(" + command + ")", sandbox));
                    break;

                case "string":
                    elem.addEventListener("command", Components.utils.evalInSandbox("(function (e) {" + command + "})", sandbox));
                    break;

                default:
                    console.log('Unknown command type:', commandKey, command, commandType);
                    break;
            }
            fragment.appendChild(elem);
        }, this);

        return fragment;
    },

    _loadFile(file)
    {
        const fStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        const sStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
        fStream.init(file, -1, 0, 0);
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

KeyChanger.registerMenu();
KeyChanger.registerKeys();
