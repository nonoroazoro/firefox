// skip 1st line

try
{
    const { classes: Cc, interfaces: Ci } = Components;

    try
    {
        // Load file: /chrome/chrome.manifest
        const file = Services.dirsvc.get("UChrm", Ci.nsIFile);
        file.append("chrome.manifest");
        Components.manager.QueryInterface(Ci.nsIComponentRegistrar).autoRegister(file);
    } catch { }

    function UserChrome_js()
    {
        Services.obs.addObserver(this, "domwindowopened", false);
    };

    UserChrome_js.prototype = {
        observe(aSubject)
        {
            aSubject.addEventListener("load", this, true);
        },

        handleEvent(aEvent)
        {
            const document = aEvent.originalTarget;
            if (document.location && document.location.protocol === "chrome:")
            {
                // Load file: /chrome/userChrome.js
                const file = Services.dirsvc.get("UChrm", Ci.nsIFile);
                file.append("userChrome.js");
                Services.scriptloader.loadSubScript(
                    "chrome://userchromejs/content/userChrome.js?" + file.lastModifiedTime,
                    document.defaultView
                );
            }
        }
    };

    if (!Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).inSafeMode)
    {
        new UserChrome_js();
    }
} catch { }

try
{
    pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
} catch { }
