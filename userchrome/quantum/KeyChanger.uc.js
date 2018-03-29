// ==UserScript==
// @name           KeyChanger.uc.js
// @license        MIT License
// @charset        UTF-8
// @version        1.0  2018-03-20  Added support for Firefox Quantum.
// @homepageURL    https://github.com/Griever/userChromeJS/tree/master/KeyChanger
// @note           https://developer.mozilla.org/ja/XUL_Tutorial/Keyboard_Shortcuts
// ==/UserScript==

const KeyChanger = {
    get file()
    {
        const aFile = FileUtils.getFile("UChrm", ["_Keychanger.js"], false);
        delete this.file;
        return this.file = aFile;
    },

    makeKeyset: function (p_toast)
    {
        const keys = this.makeKeys();
        if (!keys) return Common.toast("Error loading _Keychanger.js", "Keychanger");

        // remove old keychanger-keyset.
        let keyset = document.getElementById("keychanger-keyset");
        if (keyset)
        {
            keyset.parentNode.removeChild(keyset);
        }

        // backup Firefox's default keys.
        const dFrag = document.createDocumentFragment();
        Array.slice(document.getElementsByTagName("keyset")).forEach(function (elem)
        {
            dFrag.appendChild(elem);
        });

        // prepare custom keys.
        keyset = document.createElement("keyset");
        keyset.setAttribute("id", "keychanger-keyset");
        keyset.appendChild(keys);

        // insert default and custom keys.
        const insPos = document.getElementById("mainPopupSet");
        insPos.parentNode.insertBefore(keyset, insPos);
        insPos.parentNode.insertBefore(dFrag, insPos);

        if (p_toast)
        {
            Common.toast("Reloaded successfully", "Keychanger");
        }
    },

    makeKeys: function ()
    {
        const config = this.loadText(this.file);
        if (!config) return null;

        const sandbox = new Components.utils.Sandbox(new XPCNativeWrapper(window));
        const keys = Components.utils.evalInSandbox("(function () {" + config + "})()", sandbox);
        if (!keys) return null;

        const dFrag = document.createDocumentFragment();
        Object.keys(keys).forEach(function (n)
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

            const elem = document.createElement("key");
            if (modifiers !== "")
            {
                elem.setAttribute("modifiers", modifiers.slice(0, -1));
            }

            if (key)
            {
                elem.setAttribute("key", key);
            }
            else if (keycode)
            {
                elem.setAttribute("keycode", keycode);
            }

            const cmd = keys[n];
            switch (typeof cmd)
            {
                case "function":
                    elem.setAttribute("oncommand", "(" + cmd.toSource() + ").call(this, event);");
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
            dFrag.appendChild(elem);
        }, this);

        return dFrag;
    },

    createMenuitem: function ()
    {
        const menuitem = document.createElement("menuitem");
        menuitem.setAttribute("label", "Reload KeyChanger(R)");
        menuitem.setAttribute("oncommand", "KeyChanger.makeKeyset(true);");
        const insPos = document.getElementById("devToolsSeparator");
        if (insPos)
        {
            insPos.parentNode.insertBefore(menuitem, insPos);
        }
    },

    loadText: function (p_file)
    {
        const fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        const sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
        fstream.init(p_file, -1, 0, 0);
        sstream.init(fstream);

        let data = sstream.read(sstream.available());
        try
        {
            data = decodeURIComponent(escape(data));
        }
        catch (e)
        {
        }
        sstream.close();
        fstream.close();
        return data;
    }
};

KeyChanger.createMenuitem();
KeyChanger.makeKeyset();
