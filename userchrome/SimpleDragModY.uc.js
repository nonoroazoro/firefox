// ==UserScript==
// @name           SimpleDragModY.uc.js
// @description    简单拖曳修改版。
// @include        chrome://browser/content/browser.xul
// @charset        UTF-8
// @version        2014.06.06
// @startup        simpleDragModY.init();
// @shutdown       simpleDragModY.uninit();
// @homepageURL    https://github.com/ywzhaiqi/userChromeJS
// ==/UserScript==

if (!window.Services)
{
    Cu.import("resource://gre/modules/Services.jsm");
}

var simpleDragModY = {
    localLinkRegExp: /(file|localhost):\/\/.+/i,

    init: function ()
    {
        if (location.href == "chrome://browser/content/browser.xul")
        {
            gBrowser.mPanelContainer.addEventListener("dragstart", this, false);
            gBrowser.mPanelContainer.addEventListener("dragover", this, false);
            gBrowser.mPanelContainer.addEventListener("drop", this, false);
            gBrowser.mPanelContainer.addEventListener("dragend", this, false);
            window.addEventListener("unload", this, false);
        }
    },

    uninit: function ()
    {
        gBrowser.mPanelContainer.removeEventListener("dragstart", this, false);
        gBrowser.mPanelContainer.removeEventListener("dragover", this, false);
        gBrowser.mPanelContainer.removeEventListener("drop", this, false);
        gBrowser.mPanelContainer.removeEventListener("dragend", this, false);
        window.removeEventListener("unload", this, false);
    },

    handleEvent: function (event)
    {
        switch (event.type)
        {
            case "dragstart":
                this.dragstart(event);
                break;

            case "dragover":
                this.startPoint && (Cc["@mozilla.org/widget/dragservice;1"].getService(Ci.nsIDragService).getCurrentSession().canDrop = true);
                break;

            case "dragend":
            case "drop":
                if (this.startPoint && event.target.localName != "textarea" && (!(event.target.localName == "input" && (event.target.type == "text" || event.target.type == "password"))) && event.target.contentEditable != "true")
                {
                    event.preventDefault();
                    event.stopPropagation();
                    this.dragdrop(event);
                    this.startPoint = 0;
                }
                break;

            case "unload":
                this.uninit();
                break;
        }
    },

    dragstart: function (event)
    {
        this.startPoint = [event.screenX, event.screenY];
        event.target.localName == "img" && event.dataTransfer.setData("application/x-moz-file-promise-url", event.target.src);
        if (event.target.nodeName == "A")
        {
            var selectLinkText = document.commandDispatcher.focusedWindow.getSelection().toString();
            if (selectLinkText != "" && event.explicitOriginalTarget == document.commandDispatcher.focusedWindow.getSelection().focusNode)
            {
                event.dataTransfer.setData("text/plain", selectLinkText);
                event.dataTransfer.clearData("text/x-moz-url");
                event.dataTransfer.clearData("text/x-moz-url-desc");
                event.dataTransfer.clearData("text/x-moz-url-data");
                event.dataTransfer.clearData("text/uri-list");
            }
        }
    },

    dragdrop: function (event)
    {
        var transfer = event.dataTransfer;
        var direction = this.getDirection(event);
        if (transfer.types.contains("text/x-moz-url"))
        {
            // 链接
            var url = transfer.getData("text/x-moz-url").replace(/[\n\r]+/g, "\n").split("\n")[0];
            if (url.indexOf("javascript:") != 0)
            {
                if (direction == "U")
                {
                    // 新标签打开链接(后台)
                    gBrowser.addTab(url);
                } else if (direction == "D")
                {
                    //下载链接
                    saveImageURL(url, null, null, null, true, null, document);
                } else if (direction == "L")
                {
                    // 新标签打开链接(前台)
                    gBrowser.selectedTab = gBrowser.addTab(url);
                } else if (direction == "R")
                {
                    // 新标签打开链接(后台)
                    gBrowser.addTab(url);
                }
            }
        } else if (transfer.types.contains("application/x-moz-file-promise-url"))
        {
            // 图片
            var url = transfer.getData("application/x-moz-file-promise-url");
            if (direction == "U")
            {
                // 搜索相似图片（前台）
                gBrowser.selectedTab = gBrowser.addTab('http://www.google.com/searchbyimage?image_url=' + encodeURI(url));
            } else if (direction == "D")
            {
                // 下载图片
                saveImageURL(url, null, null, null, true, null, document);
            } else if (direction == "L")
            {
                // 新标签打开图片(前台)
                gBrowser.selectedTab = gBrowser.addTab(url);
            } else if (direction == "R")
            {
                // 新标签打开图片(后台)
                gBrowser.addTab(url);
            }
        } else
        {
            // 文本，包括链接文本、非链接文本等
            var url;
            var text = transfer.getData("text/unicode").trim();
            if (this.localLinkRegExp.test(text))
            {
                url = text;
            } else if (!!text.match(/^\s*(?:data:|about:config\?filter=)/i))
            {
                url = text;
            } else if (this.seemAsURL(text))
            {
                url = this.getFixedDroppedURL(text);
            }

            if (url)
            {
                gBrowser.addTab(url);
            } else
            {
                var engine = Services.search.defaultEngine;
                var submission = engine.getSubmission(text, null);
                if (submission)
                {
                    openLinkIn(submission.uri.spec, "tab", {
                        postData: submission.postData,
                        inBackground: direction != "L",
                        relatedToCurrent: true
                    });
                }
            }
        }
    },

    getDirection: function (event)
    {
        var [subX, subY] = [event.screenX - this.startPoint[0], event.screenY - this.startPoint[1]];
        var [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
        var direction;
        if (distX > distY)
        {
            direction = subX < 0 ? "L" : "R";
        } else
        {
            direction = subY < 0 ? "U" : "D";
        }
        return direction;
    },

    seemAsURL: function (url)
    {
        if (url)
        {
            var aURL = url.replace(/ /g, "");
            var DomainName = /(\w+(\-+\w+)*\.)+\w{2,7}/i;
            var KnowNameOrSlash = /^(www|bbs|forum|blog)|\//i;
            var KnowTopDomain1 = /\.(com|net|org|gov|edu|info|mobi|mil|asia)$/i;
            var KnowTopDomain2 = /\.(de|uk|eu|nl|it|cn|be|us|br|jp|ch|fr|at|se|es|cz|pt|ca|ru|hk|tw|pl|me|tv|cc)$/i;
            var IsIpAddress = /^([1-2]?\d?\d\.){3}[1-2]?\d?\d/;
            var seemAsURL = DomainName.test(aURL) && (KnowNameOrSlash.test(aURL) || KnowTopDomain1.test(aURL) || KnowTopDomain2.test(aURL) || IsIpAddress.test(aURL));
            return seemAsURL;
        }
        return false;
    },

    // 修正 URL，来自 DragNgoModoki_Fx3.7.uc.js，略作修改。
    getFixedDroppedURL: function (url)
    {
        url = url.replace(/ /g, "");
        if (/^h?.?.p(s?):(.+)$/i.test(url))
        {
            url = "http" + RegExp.$1 + ':' + RegExp.$2;
            if (RegExp.$2)
            {
                var URIFixup = Cc["@mozilla.org/docshell/urifixup;1"]
                    .getService(Ci.nsIURIFixup);
                try
                {
                    url = URIFixup.createFixupURI(url, URIFixup.FIXUP_FLAG_ALLOW_KEYWORD_LOOKUP).spec;
                    if (!(!url ||
                        !url.length ||
                        url.indexOf(" ", 0) != -1 ||
                        /^\s*javascript:/.test(url) ||
                        /^\s*data:/.test(url) && !/^\s*data:image\//.test(url)))
                    {
                        return url;
                    }
                } catch (e) { }
            }
        }
        return null;
    },
};

simpleDragModY.init();
