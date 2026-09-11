// skip 1st line

try
{
    const { classes: Cc, interfaces: Ci } = Components;

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
                const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
                const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
                const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
                const file = ds.get("UChrm", Ci.nsIFile);
                file.append("userChrome.js");
                const fileURL = fph.getURLSpecFromActualFile(file) + "?" + file.lastModifiedTime;
                Services.scriptloader.loadSubScriptWithOptions(fileURL, {
                    target: document.defaultView,
                    allowUnsafeURL: true
                });
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
