// 2020-12-31

(function ()
{
    const DEBUG = false;
    const REPLACE_CACHE = true;
    const BOWSER_CHROME_URL = "chrome://browser/content/browser.xhtml";

    // 略过空页面。
    if (!/^(chrome:|about:)/i.test(location.href)) return;
    if (/^(about:(blank|newtab|home))/i.test(location.href)) return;

    // 略过对话框。
    if (location.href === "chrome://global/content/commonDialog.xul") return;
    if (location.href === "chrome://global/content/commonDialog.xhtml") return;
    if (location.href === "chrome://global/content/selectDialog.xhtml") return;
    if (location.href === "chrome://global/content/alerts/alert.xul") return;
    if (location.href === "chrome://global/content/alerts/alert.xhtml") return;
    if (/\.html?$/i.test(location.href)) return;

    window.userChrome_js = {
        scripts: [],
        overlays: [],

        shutdown: false,
        overlayWait: 0,
        overlayUrl: [],

        prepareScripts()
        {
            const Cc = Components.classes;
            const Ci = Components.interfaces;
            const Ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
            const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
            const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);

            // Parse scripts.
            try
            {
                const workDir = Ds.get("UChrm", Ci.nsIFile);
                const files = workDir.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
                while (files.hasMoreElements())
                {
                    const file = files.getNext().QueryInterface(Ci.nsIFile);
                    if (/\.uc\.js$|\.uc\.xul$/i.test(file.leafName))
                    {
                        const script = _parseScriptFile(_readFile(file), file);
                        if (/\.uc\.js$/i.test(script.filename))
                        {
                            this.scripts.push(script);
                        }
                        else
                        {
                            script.xul = '<?xul-overlay href=\"' + script.url + '\"?>\n';
                            this.overlays.push(script);
                        }
                    }
                }
                // Sort scripts by filename.
                this.scripts.sort((a, b) => a.filename.localeCompare(b.filename));
            }
            catch { }

            console.log("UserChrome.js - Scripts:", this.scripts);
            console.log("UserChrome.js - Overlays:", this.overlays);

            // Parses script from file.
            function _parseScriptFile(p_content, p_file)
            {
                const result = {
                    file: p_file,
                    filename: p_file.leafName,
                    url: fph.getURLSpecFromActualFile(p_file)
                };

                const findNextRe = /^\/\/ @(include|exclude)[ \t]+(\S+)/gm;
                const header = (p_content.match(/^\/\/ ==UserScript==[ \t]*\n(?:.*\n)*?\/\/ ==\/UserScript==[ \t]*\n/m) || [""])[0];

                let match;

                // Regex.
                const rex = { include: [], exclude: [] };
                while (match = findNextRe.exec(header))
                {
                    rex[match[1]].push(match[2].replace(/^main$/i, BOWSER_CHROME_URL).replace(/\W/g, "\\$&").replace(/\\\*/g, ".*?"));
                }
                if (rex.include.length === 0)
                {
                    rex.include.push(BOWSER_CHROME_URL);
                }
                const exclude = rex.exclude.length > 0 ? "(?!" + rex.exclude.join("$|") + "$)" : "";
                result.regex = new RegExp("^" + exclude + "(" + (rex.include.join("|") || ".*") + ")$", "i");

                // Charset.
                match = header.match(/\/\/ @charset\b(.+)\s*/i);
                if (match)
                {
                    result.charset = match.length > 0 ? match[1].replace(/^\s+/, "") : "";
                }

                // Description.
                match = header.match(/\/\/ @description\b(.+)\s*/i);
                if (match)
                {
                    result.description = match.length > 0 ? match[1].replace(/^\s+/, "") : "";
                }
                if (result.description === "" || !result.description)
                {
                    result.description = p_file.leafName;
                }

                return result;
            }

            function _readFile(p_file, p_metaOnly = true)
            {
                const stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
                stream.init(p_file, 0x01, 0, 0);
                const cStream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
                cStream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
                let content = "";
                const data = {};
                while (cStream.readString(4096, data))
                {
                    content += data.value;
                    if (p_metaOnly && content.indexOf("// ==/UserScript==") > 0)
                    {
                        break;
                    }
                }
                cStream.close();
                return content.replace(/\r\n?/g, "\n");
            }
        },

        getLastModifiedTime(p_scriptFile)
        {
            if (REPLACE_CACHE)
            {
                return p_scriptFile.lastModifiedTime;
            }
            return "";
        },

        loadOverlay(p_url, p_observer, p_doc)
        {
            window.userChrome_js.overlayUrl.push([p_url, p_observer, p_doc]);
            if (!window.userChrome_js.overlayWait) window.userChrome_js.load(++window.userChrome_js.overlayWait);
        },

        load()
        {
            if (!window.userChrome_js.overlayUrl.length) return --window.userChrome_js.overlayWait;
            const [url, aObserver, doc = document] = this.overlayUrl.shift();
            if (typeof aObserver === "function")
            {
                aObserver.observe = aObserver;
            }
            const observer = {
                observe(p_subject, p_topic, p_data)
                {
                    if (p_topic === "xul-overlay-merged")
                    {
                        // XXX We just caused localstore.rdf to be re-applied (bug 640158)
                        if (window.retrieveToolbarIconsizesFromTheme)
                        {
                            window.retrieveToolbarIconsizesFromTheme();
                        }
                        if (aObserver && typeof aObserver.observe === "function")
                        {
                            try
                            {
                                aObserver.observe(p_subject, p_topic, p_data);
                            }
                            catch (error)
                            {
                                DEBUG && console.log(`Failed to observe overlay:`, url, error);
                            }
                        }
                        if (window.userChrome_js)
                        {
                            window.userChrome_js.load();
                        }
                    }
                },
                QueryInterface(handlerId)
                {
                    if (
                        !handlerId.equals(Components.interfaces.nsISupports)
                        && !handlerId.equals(Components.interfaces.nsIObserver)
                    )
                    {
                        DEBUG && console.log(`Invalid handler id:`, handlerId);
                        throw Components.results.NS_ERROR_NO_INTERFACE;
                    }
                    return this;
                }
            };

            try
            {
                DEBUG && console.log("document.loadOverlay:", url);
                if (window.userChrome_js.shutdown) return;
                doc.loadOverlay(url, observer);
            }
            catch (error)
            {
                DEBUG && console.log(`Failed to run document.loadOverlay:`, url, error);
            }
            return 0;
        },

        runOverlays(doc)
        {
            let href;
            try
            {
                href = doc.location.href.replace(/#.*$/, "");
            }
            catch
            {
                return;
            }

            this.overlays.forEach((overlay, index) =>
            {
                if (overlay.regex.test(href))
                {
                    this.loadOverlay(overlay.url + "?" + this.getLastModifiedTime(overlay.file), null, doc);
                    DEBUG && console.log(`Loaded Overlay ${index + 1}:`, overlay.filename);
                }
                else
                {
                    DEBUG && console.log(`Skipped Overlay ${index + 1}:`, overlay.filename);
                }
            });
        },

        runScripts(doc)
        {
            if (!(doc instanceof HTMLDocument /* || doc instanceof XULDocument ||*/))
            {
                return;
            }

            let href;
            try
            {
                href = doc.location.href.replace(/#.*$/, "");
            }
            catch
            {
                return;
            }

            const scriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                .getService(Components.interfaces.mozIJSSubScriptLoader);
            this.scripts.forEach((script, index) =>
            {
                if (script.regex.test(href))
                {
                    try
                    {
                        scriptLoader.loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file), doc.defaultView, script.charset);
                        DEBUG && console.log(`Loaded Script ${index + 1}:`, script.filename);
                    }
                    catch (error)
                    {
                        DEBUG && console.log(`Failed to load script ${index + 1}:`, script.filename, error);
                    }
                }
                else
                {
                    DEBUG && console.log(`Skipped Script ${index + 1}:`, script.filename);
                }
            });
        }
    };

    // Startup.
    const userChrome = window.userChrome_js;
    window.addEventListener("unload", () =>
    {
        userChrome.shutdown = true;
    }, false);
    userChrome.prepareScripts();

    DEBUG && console.info("Load in url:", location.href);
    // Bug 330458 Cannot dynamically load an overlay using document.loadOverlay
    // until a previous overlay is completely loaded
    if (gBrowser != null)
    {
        userChrome.runScripts(document);
        setTimeout(() => { userChrome.runOverlays(document); }, 0);
    }
    else
    {
        setTimeout(() =>
        {
            userChrome.runScripts(document);
            setTimeout(() => { userChrome.runOverlays(document); }, 0);
        }, 0);
    }

    if (location.href != BOWSER_CHROME_URL) return;

    // WebPanel
    const loadInWebPanel = {
        sidebarWindow: null,
        init(sidebarWindow)
        {
            this.sidebarWindow = sidebarWindow;
            this.sidebarWindow.document.getElementById("web-panels-browser").addEventListener("load", this, true);
            this.sidebarWindow.addEventListener("unload", this, false);
        },
        handleEvent(event)
        {
            switch (event.type)
            {
                case "load":
                    this.load(event);
                    break;

                case "unload":
                    this.unload(event);
                    break;
            }
        },
        load(event)
        {
            const target = event.originalTarget;
            if (!target.location) return;

            const href = target.location.href;
            if (!/^chrome:/.test(href)) return;
            DEBUG && console.log("Load in WebPanel:", href);
            setTimeout(() =>
            {
                userChrome.runScripts(target);
                setTimeout(() => { userChrome.runOverlays(target); }, 0);
            }, 0);
        },
        unload()
        {
            this.sidebarWindow.document.getElementById("web-panels-browser").removeEventListener("load", this, true);
            this.sidebarWindow.removeEventListener("unload", this, false);
        }
    }

    // Sidebar.
    window.document.addEventListener("load", (event) =>
    {
        const target = event.originalTarget;
        if (!target.location) return;

        const href = target.location.href;
        if (/^(about:(blank|newtab|home))/i.test(href)) return;
        if (!/^(about:|chrome:)/.test(href)) return;
        // 略过对话框。
        if (href == "chrome://global/content/commonDialog.xhtml") return;
        if (href == "chrome://global/content/selectDialog.xhtml") return;
        if (href == "chrome://global/content/alerts/alert.xhtml") return;
        DEBUG && console.log("Load in sidebar:", href);
        setTimeout(() =>
        {
            userChrome.runScripts(target);
            setTimeout(() => { userChrome.runOverlays(target); }, 0);
        }, 0);
        if (href != "chrome://browser/content/web-panels.xul") return;
        if (!window.document.getElementById("sidebar")) return;
        const sidebarWindow = window.document.getElementById("sidebar").contentWindow;
        if (sidebarWindow)
        {
            loadInWebPanel.init(sidebarWindow);
        }
    }, true);
})();
