// ==UserScript==
// @name                 Mousegestures.uc.js
// @namespace            Mousegestures@gmail.com
// @description          自定义鼠标手势
// @author               紫云飞&黒仪大螃蟹
// @charset              UTF-8
// @homepageURL          http://www.cnblogs.com/ziyunfei/archive/2011/12/15/2289504.html
// @include              chrome://browser/content/browser.xhtml
// @include              chrome://browser/content/browser.xul
// ==/UserScript==

// Context menu not working yet.

const MouseGestures = {
    MOUSE_LEFT: 0,
    MOUSE_RIGHT: 2,
    lastX: 0,
    lastY: 0,
    directionChain: "",
    isMouseRightDown: false,
    isDrawing: true,
    GESTURES: {
        "L": { name: "后退", cmd: () => gBrowser.webNavigation.canGoBack && gBrowser.webNavigation.goBack() },
        "R": { name: "前进", cmd: () => gBrowser.webNavigation.canGoForward && gBrowser.webNavigation.goForward() },

        "U": { name: "向上滚动", cmd: () => goDoCommand("cmd_scrollPageUp") },
        "D": { name: "向下滚动", cmd: () => goDoCommand("cmd_scrollPageDown") },

        "UD": { name: "刷新", cmd: function () { document.getElementById("Browser:Reload").doCommand(); } },
        "DU": { name: "强制刷新", cmd: function () { document.getElementById("Browser:ReloadSkipCache").doCommand(); } },

        "RL": { name: "打开新标签", cmd: function () { BrowserOpenTab(); } },
        "LR": { name: "恢复关闭标签", cmd: function () { try { document.getElementById("History:UndoCloseTab").doCommand(); } catch (ex) { if ("undoRemoveTab" in gBrowser) gBrowser.undoRemoveTab(); else throw "Session Restore feature is disabled." } } },

        "UL": { name: "激活左边的标签页", cmd: function (event) { gBrowser.tabContainer.advanceSelectedTab(-1, true); } },
        "UR": { name: "激活右边的标签页", cmd: function (event) { gBrowser.tabContainer.advanceSelectedTab(1, true); } },

        "W+": { name: "激活右边的标签页", cmd: function (event) { gBrowser.tabContainer.advanceSelectedTab(+1, true); } },
        "W-": { name: "激活左边的标签页", cmd: function (event) { gBrowser.tabContainer.advanceSelectedTab(-1, true); } },

        "DL": { name: "添加书签", cmd: function () { document.getElementById("Browser:AddBookmarkAs").doCommand(); } },
        "DR": { name: "关闭标签页", cmd: function (event) { if (gBrowser.selectedTab.getAttribute("pinned") !== "true") { gBrowser.removeCurrentTab(); } } },

        "RU": { name: "转到页首", cmd: () => goDoCommand("cmd_scrollTop") },
        "RD": { name: "转到页尾", cmd: () => goDoCommand("cmd_scrollBottom") },

        //"URD": {name: "打开附加组件",  cmd: function(event) {	BrowserOpenAddonsMgr();	}},
        //"DRU": {name: "打开选项",  cmd: function(event) {		openPreferences(); }},

        "LU": { name: "查看页面信息", cmd: function (event) { BrowserPageInfo(); } },
        "LD": { name: "侧边栏打开当前页", cmd: function (event) { SidebarUI.toggle("viewHistorySidebar"); } },

        // C字形：
        "LDR": { name: "打开书签工具栏", cmd: function (event) { var bar = document.getElementById("PersonalToolbar"); setToolbarVisibility(bar, bar.collapsed); } },

        "RLRL": { name: "重启浏览器", cmd: function (event) { Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit); } },
        "LRLR": { name: "重启浏览器", cmd: function (event) { Services.startup.quit(Services.startup.eRestart | Services.startup.eAttemptQuit); } },

        "RULD": { name: "添加到稍后阅读", cmd: function (event) { document.getElementById("pageAction-urlbar-_cd7e22de-2e34-40f0-aeff-cec824cbccac_").click(); } },
        "RULDR": { name: "添加到稍后阅读", cmd: function (event) { document.getElementById("pageAction-urlbar-_cd7e22de-2e34-40f0-aeff-cec824cbccac_").click(); } },

        "LDL": { name: "关闭左侧标签页", cmd: function (event) { for (let i = gBrowser.selectedTab._tPos - 1; i >= 0; i--) if (!gBrowser.tabs[i].pinned) { gBrowser.removeTab(gBrowser.tabs[i], { animate: true }); } } },
        "RDR": { name: "关闭右侧标签页", cmd: function (event) { gBrowser.removeTabsToTheEndFrom(gBrowser.selectedTab); gBrowser.removeTabsToTheEndFrom(gBrowser.selectedTab); gBrowser.removeTabsToTheEndFrom(gBrowser.selectedTab); } },
        "RDLRDL": { name: "关闭其他标签页", cmd: function (event) { gBrowser.removeAllTabsBut(gBrowser.selectedTab); } },

        "LDRUL": { name: "打开鼠标手势设置文件", cmd: function (event) { FileUtils.getFile("UChrm", ["SubScript", "MouseGestures.uc.js"]).launch(); } },
    },

    init()
    {
        let self = this;
        ["mousedown", "mousemove", "mouseup", "contextmenu"].forEach(type =>
        {
            gBrowser.tabpanels.addEventListener(type, self, true);
        });
        gBrowser.tabpanels.addEventListener("unload", () =>
        {
            ["mousedown", "mousemove", "mouseup", "contextmenu"].forEach(type =>
            {
                gBrowser.tabpanels.removeEventListener(type, self, true);
            });
        }, false);
    },

    handleEvent(event)
    {
        switch (event.type)
        {
            case "mousedown":
                if (event.button == this.MOUSE_RIGHT)
                {
                    this.isDrawing = false;
                    this.isMouseRightDown = true;
                    [this.lastX, this.lastY, this.directionChain] = [event.screenX, event.screenY, ""];
                    (gBrowser.mPanelContainer || gBrowser.tabpanels).addEventListener("mousemove", this, false);
                } else if (event.button == this.MOUSE_LEFT)
                {
                    this.isDrawing = false;
                    this.isMouseRightDown = false;
                    this.stopGesture();
                }
                break;

            case "mousemove":
                if (this.isMouseRightDown)
                {
                    const [subX, subY] = [event.screenX - this.lastX, event.screenY - this.lastY];
                    const [distX, distY] = [(subX > 0 ? subX : (-subX)), (subY > 0 ? subY : (-subY))];
                    let direction;
                    if (distX < 10 && distY < 10)
                    {
                        return;
                    }

                    this.isDrawing = true;
                    if (distX > distY)
                    {
                        direction = subX < 0 ? "L" : "R";
                    }
                    else
                    {
                        direction = subY < 0 ? "U" : "D";
                    }
                    if (!this.xdTrailArea)
                    {
                        this.xdTrailArea = document.createXULElement("hbox");
                        let canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
                        canvas.setAttribute("width", window.screen.width);
                        canvas.setAttribute("height", window.screen.height);
                        this.xdTrailAreaContext = canvas.getContext("2d");
                        this.xdTrailArea.style.cssText = "-moz-user-focus: none !important; -moz-user-select: none !important; display: -moz-box !important; box-sizing: border-box !important; pointer-events: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; height: 100% !important; border: none !important; box-shadow: none !important; overflow: hidden !important; background: none !important; opacity: 1 !important; position: fixed !important; z-index: 2147483647 !important; display: inline !important;";
                        this.xdTrailArea.appendChild(canvas);
                        gBrowser.selectedBrowser.parentNode.insertBefore(this.xdTrailArea, gBrowser.selectedBrowser.nextSibling);
                    }
                    if (this.xdTrailAreaContext)
                    {
                        this.xdTrailAreaContext.strokeStyle = "#0065ff";
                        this.xdTrailAreaContext.lineJoin = "round";
                        this.xdTrailAreaContext.lineCap = "round";
                        this.xdTrailAreaContext.lineWidth = 2;
                        this.xdTrailAreaContext.beginPath();
                        this.xdTrailAreaContext.moveTo(this.lastX - gBrowser.selectedBrowser.screenX, this.lastY - gBrowser.selectedBrowser.screenY);
                        this.xdTrailAreaContext.lineTo(event.screenX - gBrowser.selectedBrowser.screenX, event.screenY - gBrowser.selectedBrowser.screenY);
                        this.xdTrailAreaContext.closePath();
                        this.xdTrailAreaContext.stroke();
                        this.lastX = event.screenX;
                        this.lastY = event.screenY;
                    }
                    if (direction != this.directionChain.charAt(this.directionChain.length - 1))
                    {
                        this.directionChain += direction;
                        StatusPanel._label = this.GESTURES[this.directionChain] ? "手势: " + this.directionChain + " " + this.GESTURES[this.directionChain].name : "未知手势:" + this.directionChain;
                    }
                }
                break;

            case "mouseup":
                if (this.isMouseRightDown)
                {
                    (gBrowser.mPanelContainer || gBrowser.tabpanels).removeEventListener("mousemove", this, false);

                    if (event.button == this.MOUSE_RIGHT)
                    {
                        this.isMouseRightDown = false;
                        if (this.isDrawing)
                        {
                            console.info('perform gesture');
                            this.stopGesture();
                        }
                        else
                        {
                            console.info('perform contextmenu');
                            this.showContextMenu(event);
                        }
                        this.isDrawing = false;
                    }
                }
                break;

            case "contextmenu":
                console.info('contextmenu');
                if (this.isMouseRightDown || this.isDrawing)
                {
                    console.info('contextmenu disabled');
                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
        }
    },

    stopGesture()
    {
        if (this.GESTURES[this.directionChain]) this.GESTURES[this.directionChain].cmd();
        if (this.xdTrailArea)
        {
            this.xdTrailArea.parentNode.removeChild(this.xdTrailArea);
            this.xdTrailArea = null;
            this.xdTrailAreaContext = null;
        }
        this.directionChain = "";
        setTimeout(() => StatusPanel._label = "", 2000);
    },

    showContextMenu(event)
    {
        console.info('showContextMenu');
        const contextMenuEvent = event.originalTarget.ownerDocument.createEvent("MouseEvents");
        contextMenuEvent.initMouseEvent(
            "contextmenu", true, true, event.originalTarget.defaultView, 0,
            event.screenX, event.screenY, event.clientX, event.clientY,
            false, false, false, false, 2, null
        );
        console.info(contextMenuEvent);
    }
};

MouseGestures.init();
