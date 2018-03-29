// ==UserScript==
// @name           DownloadPlus.uc.js
// @description    下载增强。
// @charset        UTF-8
// @version        1.0
// @include        chrome://mozapps/content/downloads/unknownContentType.xul
// ==/UserScript==

let downloadPlus = {
    init: function ()
    {
        if (location == "chrome://mozapps/content/downloads/unknownContentType.xul")
        {
            this.addCompleteURLButton();
            this.addSaveAsButton();
        }
    },

    /*
     * @description 下载框显示完整下载地址、单击自动复制到剪贴板。
     */
    addCompleteURLButton: function ()
    {
        let btn = document.querySelector("#source");
        btn.value = dialog.mLauncher.source.spec;
        btn.setAttribute("crop", "center");
        btn.setAttribute("tooltiptext", dialog.mLauncher.source.spec);
        btn.setAttribute("onclick", 'Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString(dialog.mLauncher.source.spec)')
    },

    /*
     * @description 下载框增加“另存为”按钮。
     */
    addSaveAsButton: function ()
    {
        let btn = document.documentElement.getButton("extra1");
        btn.setAttribute("hidden", "false");
        btn.setAttribute("label", "\u53E6\u5B58\u4E3A");
        btn.setAttribute("oncommand", 'var mainwin = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser"); mainwin.eval("(" + mainwin.internalSave.toString().replace("let ", "").replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")")(dialog.mLauncher.source.asciiSpec, null, (document.querySelector("#locationtext") ? document.querySelector("#locationtext").value : dialog.mLauncher.suggestedFileName), null, null, null, null, null, null, mainwin.document, 0, null);close()');
    },
};

downloadPlus.init();
