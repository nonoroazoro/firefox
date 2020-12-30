// 2019-12-11 fix 72 use "load" in config.js, working with Sub-Script/Overlay Loader v3.0.60mod
try
{
    let { classes: Cc, interfaces: Ci, utils: Cu } = Components;

    Cu.import("resource://gre/modules/Services.jsm");
    Cu.import("resource://gre/modules/osfile.jsm");

    function UserChrome_js()
    {
        Services.obs.addObserver(this, "domwindowopened", false);
    };

    UserChrome_js.prototype = {
        observe: function (aSubject, aTopic, aData)
        {
            aSubject.addEventListener("load", this, true);
        },

        handleEvent: function (aEvent)
        {
            let document = aEvent.originalTarget;
            if (document.location && document.location.protocol == "chrome:")
            {
                let file = Services.dirsvc.get("UChrm", Ci.nsIFile);
                file.append("userChrome.js");
                let fileURL = Services.io.getProtocolHandler("file")
                    .QueryInterface(Ci.nsIFileProtocolHandler)
                    .getURLSpecFromFile(file) + "?" + file.lastModifiedTime;
                Services.scriptloader.loadSubScript(fileURL, document.defaultView, "UTF-8");
            }
        },
    };

    if (!Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime).inSafeMode)
    {
        new UserChrome_js();
    }
} catch (ex) { };

try
{
    pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
} catch (e) { }
