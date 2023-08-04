// skip 1st line

try
{
    const { classes: Cc, interfaces: Ci, } = Components;

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
                const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
                const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
                const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);

                const file = ds.get("UChrm", Ci.nsIFile);
                file.append("userChrome.js");
                const fileURL = fph.getURLSpecFromActualFile(file) + "?" + file.lastModifiedTime;
                Cc["@mozilla.org/moz/jssubscript-loader;1"]
                    .getService(Ci.mozIJSSubScriptLoader)
                    .loadSubScript(fileURL, document.defaultView, "UTF-8");
            }
        }
    };

    if (!Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).inSafeMode)
    {
        new UserChrome_js();
    }
} catch { };

try
{
    pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
} catch { }
