// 2019/12/11 automatically includes all files ending in .uc.xul and .uc.js from the profile's chrome folder

(function ()
{
  "use strict";

  // -- config --
  var INFO = true;
  const REPLACECACHE = true; //スクリプトの更新日付によりキャッシュを更新する: true , しない:[false]
  const USE_0_63_FOLDER = true; //0.63のフォルダ規則を使う[true], 使わないfalse
  //=====================USE_0_63_FOLDER = falseの時===================
  var UCJS = new Array("UCJSFiles", "userContent", "userMenu"); //UCJS Loader 仕様を適用 (NoScriptでfile:///を許可しておく)
  var arrSubdir = new Array("", "xul", "TabMixPlus", "withTabMixPlus", "SubScript", "UCJSFiles", "userCrome.js.0.8", "userContent", "userMenu");    //スクリプトはこの順番で実行される
  //===================================================================
  const ALWAYSEXECUTE = ['rebuild_userChrome.uc.xul', 'rebuild_userChrome.uc.js']; //常に実行するスクリプト
  var BROWSERCHROME = "chrome://browser/content/browser.xhtml"; //Firfox
  //"chrome://browser/content/browser.xul"; //Firfox
  //var BROWSERCHROME = "chrome://navigator/content/navigator.xul"; //SeaMonkey:
  // -- config --
  /* USE_0_63_FOLDER true の時
   * chrome直下およびchrome/xxx.uc 内の *.uc.js および *.uc.xul
   * chrome/xxx.xul 内の  *.uc.js , *.uc.xul および *.xul
   * chrome/xxx.ucjs 内の *.uc.js は 特別に UCJS Loader 仕様を適用(NoScriptでfile:///を許可しておく)
   */

  /* USE_0.63_FOLDER false の時
   *[ フォルダは便宜上複数のフォルダに分けているだけで任意。 下のarrSubdirで指定する ]
   *[ UCJS Loaderを適用するフォルダをUCJSで指定する                                  ]
    プロファイル-+-chrome-+-userChrome.js(このファイル)
                          +-*.uc.jsまたは*.uc.xul群
                          |
                          +-SubScript--------+-*.uc.jsまたは*.uc.xul群
                          |
                          +-UCJSFiles--------+-*.uc.jsまたは*.uc.xul群
                          | (UCJS_loaderでしか動かないもの JavaScript Version 1.7/日本語)
                          |
                          +-xul--------------+-*.xul, *.uc.xulおよび付随File
                          |
                          +-userCrome.js.0.8-+-*.uc.jsまたは*.uc.xul群 (綴りが変なのはなぜかって? )
   */

  //chrome/aboutでないならスキップ
  if (!/^(chrome:|about:)/i.test(location.href)) return;
  if (/^(about:(blank|newtab|home))/i.test(location.href)) return;
  //コモンダイアログに対するオーバーレイが今のところ無いので時間短縮のためスキップすることにした
  if (location.href == 'chrome://global/content/commonDialog.xul') return;
  if (location.href == 'chrome://global/content/commonDialog.xhtml') return;
  if (location.href == 'chrome://global/content/selectDialog.xhtml') return;
  if (location.href == 'chrome://global/content/alerts/alert.xul') return;
  if (location.href == 'chrome://global/content/alerts/alert.xhtml') return;
  if (/\.html?$/i.test(location.href)) return;
  window.userChrome_js = {
    USE_0_63_FOLDER,
    UCJS,
    arrSubdir,
    ALWAYSEXECUTE,
    INFO,
    BROWSERCHROME,
    REPLACECACHE,

    // 创建脚本数据。
    getScripts: function ()
    {
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      const ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
      const fph = ios.getProtocolHandler("file").QueryInterface(Ci.nsIFileProtocolHandler);
      const ds = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
      var Start = new Date().getTime();
      //getdir
      if (this.USE_0_63_FOLDER)
      {
        var o = [""];
        this.UCJS = [];
        this.arrSubdir = [];
        var workDir = ds.get("UChrm", Ci.nsIFile);
        var dir = workDir.directoryEntries;
        while (dir.hasMoreElements())
        {
          var file = dir.getNext().QueryInterface(Ci.nsIFile);
          if (!file.isDirectory()) continue;
          var dirName = file.leafName;
          if (/(uc|xul|ucjs)$/i.test(dirName))
          {
            o.push(dirName);
            if (/ucjs$/i.test(dirName))
            {
              this.UCJS.push(dirName);
            }
          }
        }
        [].push.apply(this.arrSubdir, o);
      }

      var that = this;
      var mediator = Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator);
      if (mediator.getMostRecentWindow("navigator:browser"))
        var mainWindowURL = that.BROWSERCHROME;
      else if (mediator.getMostRecentWindow("mail:3pane"))
        var mainWindowURL = "chrome://messenger/content/messenger.xul";

      this.dirDisable = restoreState(getPref("userChrome.disable.directory", "str", "").split(','));
      this.scriptDisable = restoreState(getPref("userChrome.disable.script", "str", "").split(','));
      this.scripts = [];
      this.overlays = [];

      var findNextRe = /^\/\/ @(include|exclude)[ \t]+(\S+)/gm;
      this.directory = { name: [], UCJS: [], enable: [] };
      for (var i = 0, len = this.arrSubdir.length; i < len; i++)
      {
        var s = [], o = [];
        try
        {
          var dir = this.arrSubdir[i] == "" ? "root" : this.arrSubdir[i];
          this.directory.name.push(dir);
          this.directory.UCJS.push(checkUCJS(dir));

          var workDir = ds.get("UChrm", Ci.nsIFile);
          workDir.append(this.arrSubdir[i]);
          var files = workDir.directoryEntries.QueryInterface(Ci.nsISimpleEnumerator);
          while (files.hasMoreElements())
          {
            var file = files.getNext().QueryInterface(Ci.nsIFile);
            if (/\.uc\.js$|\.uc\.xul$/i.test(file.leafName)
              || /\.xul$/i.test(file.leafName) && /\xul$/i.test(this.arrSubdir[i]))
            {
              var script = getScriptData(readFile(file, true), file);
              script.dir = dir;
              if (/\.uc\.js$/i.test(script.filename))
              {
                script.ucjs = checkUCJS(script.file.path);
                s.push(script);
              }
              else
              {
                script.xul = '<?xul-overlay href=\"' + script.url + '\"?>\n';
                o.push(script);
              }
            }
          }
        }
        catch (e) { }
        this.debug('script', s);
        [].push.apply(this.scripts, s.sort((a, b) => a.filename.localeCompare(b.filename)));
        [].push.apply(this.overlays, o);
      }

      this.debug('Parsing getScripts: ' + ((new Date()).getTime() - Start) + 'msec');

      //UCJSローダ必要か
      function checkUCJS(aPath)
      {
        for (var i = 0, len = that.UCJS.length; i < len; i++)
        {
          if (aPath.indexOf(that.UCJS[i], 0) > -1)
            return true;
        }
        return false;
      }

      //メタデータ収集
      function getScriptData(aContent, aFile)
      {
        var charset, description;
        var header = (aContent.match(/^\/\/ ==UserScript==[ \t]*\n(?:.*\n)*?\/\/ ==\/UserScript==[ \t]*\n/m) || [""])[0];
        var match, rex = { include: [], exclude: [] };
        while ((match = findNextRe.exec(header)))
        {
          rex[match[1]].push(match[2].replace(/^main$/i, mainWindowURL).replace(/\W/g, "\\$&").replace(/\\\*/g, ".*?"));
        }
        if (rex.include.length == 0) rex.include.push(mainWindowURL);
        var exclude = rex.exclude.length > 0 ? "(?!" + rex.exclude.join("$|") + "$)" : "";

        match = header.match(/\/\/ @charset\b(.+)\s*/i);
        charset = "";
        //try
        if (match)
        {
          charset = match.length > 0 ? match[1].replace(/^\s+/, "") : "";
        }

        match = header.match(/\/\/ @description\b(.+)\s*/i);
        description = "";
        //try
        if (match)
          description = match.length > 0 ? match[1].replace(/^\s+/, "") : "";
        //}catch(e){}
        if (description == "" || !description)
        {
          description = aFile.leafName;
        }
        var url = fph.getURLSpecFromFile(aFile);

        return {
          filename: aFile.leafName,
          file: aFile,
          url: url,
          //namespace: "",
          charset: charset,
          description: description,
          //code: aContent.replace(header, ""),
          regex: new RegExp("^" + exclude + "(" + (rex.include.join("|") || ".*") + ")$", "i")
        }
      }

      //スクリプトファイル読み込み
      function readFile(aFile, metaOnly)
      {
        if (typeof metaOnly == 'undefined')
          metaOnly = false;
        var stream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
        stream.init(aFile, 0x01, 0, 0);
        var cvstream = Cc["@mozilla.org/intl/converter-input-stream;1"].
          createInstance(Ci.nsIConverterInputStream);
        cvstream.init(stream, "UTF-8", 1024, Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
        var content = "", data = {};
        while (cvstream.readString(4096, data))
        {
          content += data.value;
          if (metaOnly &&
            content.indexOf('// ==/UserScript==') > 0)
            break;
        }
        cvstream.close();
        return content.replace(/\r\n?/g, "\n");
      }

      //prefを読み込み
      function getPref(aPrefString, aPrefType, aDefault)
      {
        var xpPref = Components.classes['@mozilla.org/preferences-service;1']
          .getService(Components.interfaces.nsIPrefService);
        try
        {
          switch (aPrefType)
          {
            case 'complex':
              return xpPref.getComplexValue(aPrefString, Components.interfaces.nsILocalFile);
            case 'str':
              return unescape(xpPref.getCharPref(aPrefString).toString());
            case 'int':
              return xpPref.getIntPref(aPrefString);
            case 'bool':
            default:
              return xpPref.getBoolPref(aPrefString);
          }
        }
        catch (e)
        {
        }
        return aDefault;
      }

      //pref文字列変換
      function restoreState(a)
      {
        try
        {
          var sd = [];
          for (var i = 0, max = a.length; i < max; ++i) sd[unescape(a[i])] = true;
          return sd;
        }
        catch (e) { return []; }
      }
    },

    getLastModifiedTime: function (aScriptFile)
    {
      if (this.REPLACECACHE)
      {
        return aScriptFile.lastModifiedTime;
      }
      return "";
    },

    //window.userChrome_js.loadOverlay
    shutdown: false,
    overlayWait: 0,
    overlayUrl: [],
    loadOverlay: function (url, observer, doc)
    {
      window.userChrome_js.overlayUrl.push([url, observer, doc]);
      if (!window.userChrome_js.overlayWait) window.userChrome_js.load(++window.userChrome_js.overlayWait);
    },

    load: function ()
    {
      if (!window.userChrome_js.overlayUrl.length) return --window.userChrome_js.overlayWait;
      var [url, aObserver, doc] = this.overlayUrl.shift();
      if (!!aObserver && typeof aObserver == 'function')
      {
        aObserver.observe = aObserver;
      }
      if (!doc) doc = document;
      if (!(doc instanceof XULDocument))
      {
        return 0;
      }
      var observer = {
        observe: function (subject, topic, data)
        {
          if (topic == 'xul-overlay-merged')
          {
            //XXX We just caused localstore.rdf to be re-applied (bug 640158)
            if ("retrieveToolbarIconsizesFromTheme" in window)
              retrieveToolbarIconsizesFromTheme();
            if (!!aObserver && typeof aObserver.observe == 'function')
            {
              try
              {
                aObserver.observe(subject, topic, data);
              }
              catch (ex)
              {
                window.userChrome_js.error(url, ex);
              }
            }
            if ('userChrome_js' in window)
            {
              window.userChrome_js.load();
            }
          }
        },
        QueryInterface: function (aIID)
        {
          if (!aIID.equals(Components.interfaces.nsISupports)
            && !aIID.equals(Components.interfaces.nsIObserver))
          {
            throw Components.results.NS_ERROR_NO_INTERFACE;
          }
          return this
        }
      };

      if (this.INFO) this.debug("document.loadOverlay: " + url);

      try
      {
        if (window.userChrome_js.shutdown) return;
        doc.loadOverlay(url, observer);
      }
      catch (ex)
      {
        window.userChrome_js.error(url, ex);
      }
      return 0;
    },

    //xulを読み込む
    runOverlays: function (doc)
    {
      try
      {
        var dochref = doc.location.href.replace(/#.*$/, "");
      }
      catch (e)
      {
        return;
      }

      var overlay;

      for (var m = 0, len = this.overlays.length; m < len; m++)
      {
        overlay = this.overlays[m];
        if (this.ALWAYSEXECUTE.indexOf(overlay.filename) < 0
          && (!!this.dirDisable['*']
            || !!this.dirDisable[overlay.dir]
            || !!this.scriptDisable[overlay.filename]))
        {
          continue;
        }

        // decide whether to run the script
        if (overlay.regex.test(dochref))
        {
          if (this.INFO) this.debug("loadOverlay: " + overlay.filename);
          this.loadOverlay(overlay.url + "?" + this.getLastModifiedTime(overlay.file), null, doc);
        }
      }
    },

    //uc.jsを読み込む
    runScripts: function (doc)
    {
      try
      {
        var dochref = doc.location.href.replace(/#.*$/, "");
      }
      catch (e)
      {
        return;
      }
      if (!(/*doc instanceof XULDocument ||*/ doc instanceof HTMLDocument))
      {
        return;
      }

      var script, aScript;
      const Cc = Components.classes;
      const Ci = Components.interfaces;
      const maxJSVersion = (function getMaxJSVersion()
      {
        var appInfo = Components
          .classes["@mozilla.org/xre/app-info;1"]
          .getService(Components.interfaces.nsIXULAppInfo);
        var versionChecker = Components
          .classes["@mozilla.org/xpcom/version-comparator;1"]
          .getService(Components.interfaces.nsIVersionComparator);

        // Firefox 3.5 and higher supports 1.8.
        if (versionChecker.compare(appInfo.version, "3.5") >= 0)
        {
          return "1.8";
        }
        // Firefox 2.0 and higher supports 1.7.
        if (versionChecker.compare(appInfo.version, "2.0") >= 0)
        {
          return "1.7";
        }
        // Everything else supports 1.6.
        return "1.6";
      })();

      for (var m = 0, len = this.scripts.length; m < len; m++)
      {
        script = this.scripts[m];
        if (this.ALWAYSEXECUTE.indexOf(script.filename) < 0
          && (!!this.dirDisable['*']
            || !!this.dirDisable[script.dir]
            || !!this.scriptDisable[script.filename])) continue;
        if (!script.regex.test(dochref)) continue;
        if (script.ucjs)
        {
          // for UCJS_loader
          if (this.INFO) this.debug("loadUCJSSubScript: " + script.filename);
          aScript = doc.createElementNS("http://www.w3.org/1999/xhtml", "script");
          aScript.type = "application/javascript; version=" + maxJSVersion.toString().substr(0, 3);
          aScript.src = script.url + "?" + this.getLastModifiedTime(script.file);
          try
          {
            if (this.INFO) this.debug("append script: " + aScript.src);
            doc.documentElement.appendChild(aScript);
          }
          catch (ex)
          {
            this.error(script.filename, ex);
          }
        }
        else
        {
          // Not for UCJS_loader
          if (this.INFO) this.debug("loadSubScript: " + script.filename);
          try
          {
            if (script.charset)
            {
              Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                .loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file), doc.defaultView, script.charset);
            }
            else
            {
              Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader)
                .loadSubScript(script.url + "?" + this.getLastModifiedTime(script.file), doc.defaultView);
            }
          }
          catch (ex)
          {
            this.error(script.filename, ex);
          }
        }
      }
    },

    debug: function (aMsg)
    {
      Components.classes["@mozilla.org/consoleservice;1"]
        .getService(Components.interfaces.nsIConsoleService)
        .logStringMessage(aMsg);
    },

    error: function (aMsg, err)
    {
      const CONSOLE_SERVICE = Components.classes['@mozilla.org/consoleservice;1']
        .getService(Components.interfaces.nsIConsoleService);
      var error = Components.classes['@mozilla.org/scripterror;1']
        .createInstance(Components.interfaces.nsIScriptError);
      if (typeof (err) == 'object') error.init(aMsg + '\n' + err.name + ' : ' + err.message, err.fileName || null, null, err.lineNumber, null, 2, err.name);
      else error.init(aMsg + '\n' + err + '\n', null, null, null, null, 2, null);
      CONSOLE_SERVICE.logMessage(error);
    }
  };

  var that = window.userChrome_js;
  window.addEventListener("unload", function ()
  {
    that.shutdown = true;
  }, false);

  if (that.INFO) that.debug("getScripts");
  that.getScripts();

  var href = location.href;
  var doc = document;

  //Bug 330458 Cannot dynamically load an overlay using document.loadOverlay
  //until a previous overlay is completely loaded

  if (that.INFO) that.debug("load " + href);

  if (typeof gBrowser != undefined)
  {
    that.runScripts(doc);
    setTimeout(function (doc) { that.runOverlays(doc); }, 0, doc);
  }
  else
  {
    setTimeout(function (doc)
    {
      that.runScripts(doc);
      setTimeout(function (doc)
      {
        that.runOverlays(doc);
      }, 0, doc);
    }, 0, doc);
  }

  //Sidebar for Trunc
  if (location.href != that.BROWSERCHROME) return;
  window.document.addEventListener("load",
    function (event)
    {
      if (!event.originalTarget.location) return;
      if (/^(about:(blank|newtab|home))/i.test(event.originalTarget.location.href)) return;
      if (!/^(about:|chrome:)/.test(event.originalTarget.location.href)) return;
      var doc = event.originalTarget;
      var href = doc.location.href;
      if (that.INFO) that.debug("load Sidebar " + href);
      setTimeout(function (doc)
      {
        that.runScripts(doc);
        setTimeout(function (doc) { that.runOverlays(doc); }, 0, doc);
      }, 0, doc);
      if (href != "chrome://browser/content/web-panels.xul") return;
      if (!window.document.getElementById("sidebar")) return;
      var sidebarWindow = window.document.getElementById("sidebar").contentWindow;
      if (sidebarWindow)
      {
        loadInWebpanel.init(sidebarWindow);
      }
    }
    , true);

  var loadInWebpanel = {
    sidebarWindow: null,

    init: function (sidebarWindow)
    {
      this.sidebarWindow = sidebarWindow;
      this.sidebarWindow.document.getElementById("web-panels-browser").addEventListener("load", this, true);
      this.sidebarWindow.addEventListener("unload", this, false);
    },

    handleEvent: function (event)
    {
      switch (event.type)
      {
        case "unload":
          this.uninit(event);
          break;
        case "load":
          this.load(event);
          break;
      }
    },

    uninit: function (event)
    {
      this.sidebarWindow.document.getElementById("web-panels-browser").removeEventListener("load", this, true);
      this.sidebarWindow.removeEventListener("unload", this, false);
    },

    load: function (event)
    {
      var doc = event.originalTarget;
      var href = doc.location.href;
      if (!/^chrome:/.test(href)) return;
      if (that.INFO) that.debug("load Webpanel " + href);
      setTimeout(function (doc)
      {
        that.runScripts(doc);
        setTimeout(function (doc) { that.runOverlays(doc); }, 0, doc);
      }, 0, doc);
    }
  }
})();
