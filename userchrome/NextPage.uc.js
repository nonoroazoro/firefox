// ==UserScript==
// @name           NextPage.uc.js
// @description    翻页脚本
// @version        1.0
// ==/UserScript==

let nextPage = new function ()
{
    var config = {
        // 启用快捷键。
        key_enable: true,

        // 两次翻页间隔，单位：毫秒。
        key_freeze_time: 800,

        // 上一页。
        key_prev: "VK_LEFT",

        // 下一页。
        key_next: "VK_RIGHT",

        // 如果用FireGestures遇到某些翻页无效的情况，可以将值修改为true。
        isFix4FG: false
    };

    var rule = {};

    //强制使用模拟点击方式的页面,比如淘宝的成交列表,使用正则的方式来判断
    rule.forceClick = [
        /item\.taobao\.com/i,
        /news\.163\.com\/photoview\//i,
        /360buy\.com\/product/i,
        /music\.baidu.com/i,
        /blog\.sina\.com\.cn/i
    ];

    //通用规则的站点,比如discuz和phpwind的论坛
    rule.specialCommon = [
        {
            siteName: 'Discuz论坛帖子列表页面',
            url: /^https?:\/\/.+\/(?:(?:forum)|(?:showforum)|(?:viewforum))/i,
            preLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
            nextLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]'
        },
        {
            siteName: 'Discuz论坛帖子内容页面',
            url: /^https?:\/\/.+\/(?:(?:thread)|(?:viewthread)|(?:showtopic)|(?:viewtopic))/i,
            preLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="prev"][@href]',
            nextLink: '//div[@class="pages" or @class="pg"]/descendant::a[@class="next" or @class="nxt"][@href]'
        },
        {
            siteName: 'phpWind论坛帖子列表页面',
            url: /^https?:\/\/.+\/(?:bbs\/)?thread/i,
            preLink: '//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
            nextLink: '//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)][@href]'
        },
        {
            siteName: 'phpWind论坛帖子内容页面',
            url: /^https?:\/\/.+\/(?:bbs\/)?read/i,
            preLink: '//div[starts-with(@class,"pages")]/b[1]/preceding-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/preceding-sibling::li/a[1][not(@class)][@href]',
            nextLink: '//div[starts-with(@class,"pages")]/b[1]/following-sibling::a[1][not(@class)][@href] | //div[starts-with(@class,"pages")]/ul[1]/li[b]/following-sibling::li/a[1][not(@class)][@href]'
        }];

    //专用规则的站点
    rule.specialSites = [
        {
            siteName: 'google搜索', //站点名字...(可选)
            url: /^https?:\/\/\w{3,10}\.google(?:\.\w{1,4}){1,2}\/search/i, //站点正则...(~~必须~~)
            enable: true, //启用.(总开关)(可选)
            preLink: '//table[@id="nav"]/descendant::a[1][parent::td[@class="b"]]', //上一页链接 xpath 或者 CSS选择器 或者 函数返回值 (prelink 和 nextlink最少填一个)
            nextLink: '//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]' //下一页链接 xpath 或者 CSS选择器 或者 函数返回值 (prelink 和 nextlink最少填一个)
        },
        {
            siteName: 'google图片',
            url: /^https?:\/\/\w{3,7}\.google(?:\.\w{1,4}){1,2}\/images/i,
            nextLink: '//table[@id="nav"]/descendant::a[last()][parent::td[@class="b"]]'
        },
        {
            siteName: '百度搜索',
            url: /^https?:\/\/www\.baidu\.com\/(?:s|baidu)\?/i,
            enable: false,
            nextLink: '//p[@id="page"]/a[text()="下一页"][@href]'
        },
        {
            siteName: '百度MP3',
            url: /^http:\/\/mp3\.baidu\.com\/.+/i,
            nextLink: '//div[@class="pg"]/a[(font/text()="下一页")]'
        },
        {
            siteName: '百度贴吧帖子列表页面',
            url: /^http:\/\/tieba\.baidu\.com\/f\?.*kw=/i,
            nextLink: '//div[@id="pagebar"]/div[@class="pagination"]/a[text()="下一页"]'
        },
        {
            siteName: '百度贴吧俱乐部帖子列表内容页面',
            url: /^http:\/\/tieba\.baidu\.com\/club\/.+\/p\/.+/i,
            nextLink: '//div[@class="pagination"]/a[text()="下一页"]'
        },
        {
            siteName: '百度贴吧俱乐部帖子列表页面',
            url: /^http:\/\/tieba\.baidu\.com\/club\/.+(?!\/p\/)/i,
            nextLink: '//div[@class="pagination"]/a[text()="下一页"]'
        },
        {
            siteName: '百度贴吧帖子内容页面',
            url: /^http:\/\/tieba\.baidu\.com\/f\?kz=\d+/i,
            nextLink: '//li[@class="pagination"]/a[text()="下一页"]'
        },
        {
            siteName: '万卷书库小说阅读页',
            url: /^http:\/\/www\.wanjuan\.net\/article\/.+html/i,
            nextLink: '//div[@id="gotopage"]/descendant::a[text()="下一页"]'
        },
        {
            siteName: '万卷书屋小说阅读页',
            url: /^http:\/\/www\.wjxsw\.com\/html\/.+html/i,
            nextLink: '//div[@id="LinkMenu"]/descendant::a[last()]'
        },
        {
            siteName: '起点小说阅读页',
            url: /^http:\/\/www\.qidian\.com\/BookReader\/\d+,\d+/i,
            nextLink: '//a[@id="NextLink"]'
        },
        {
            siteName: '冰地小说阅读页',
            url: /^http:\/\/www\.bingdi\.com\/html\/book\/.+/i,
            nextLink: '//div[@id="LinkMenu"]/descendant::a[last()][text()="翻下页"]'
        },
        {
            siteName: 'opera官方网站帖子列表页面',
            url: /^http:\/\/bbs\.operachina\.com\/viewforum/i,
            nextLink: '//div[starts-with(@class,"pagination")]/descendant::a[text()="下一页"]'
        },
        {
            siteName: 'opera官方网站帖子内容页面',
            url: /^http:\/\/bbs\.operachina\.com\/viewtopic/i,
            nextLink: '//div[starts-with(@class,"pagination")]/descendant::a[text()="下一页"]'
        },
        {
            siteName: 'opera官方网站查看新帖帖子列表页面',
            url: /^http:\/\/bbs\.operachina\.com\/search/i,
            nextLink: '//li[contains(@class,"pagination")]/descendant::a[text()="下一页"]'
        },
        {
            siteName: '深度论坛帖子内容页面',
            url: /http:\/\/bbs\.deepin\.org\/thread/i,
            nextLink: '//div[@class="pages"]/descendant::a[@class="next"]'
        },
        {
            siteName: '卡饭论坛帖子内容页面',
            url: /http:\/\/bbs\.kafan\.cn\/thread/i,
            nextLink: '//div[@class="pg"]/descendant::a[@class="nxt"]'
        },
        {
            siteName: '卡饭论坛帖子列表页面',
            url: /http:\/\/bbs\.kafan\.cn\/forum/i,
            nextLink: '//div[@class="pg"]/descendant::a[@class="nxt"]'
        },
        {
            siteName: '远景论坛帖子内容页面',
            url: /http:\/\/bbs\.pcbeta\.com\/thread/i,
            nextLink: '//div[@class="pages"]/descendant::a[@class="next"]'
        },
        {
            siteName: '思源论坛帖子内容页面',
            url: /http:\/\/www\.missyuan\.com\/(?:view)?thread/i,
            nextLink: '//div[@class="pages"]/descendant::a[@class="next"]'
        },
        {
            siteName: '思源论坛帖子列表页面',
            url: /http:\/\/www\.missyuan\.com\/forum/i,
            nextLink: '//div[@class="pages"]/descendant::a[@class="next"]'
        },
        {
            siteName: '极点五笔帖子内容页面',
            url: /www\.wbfans\.com\/bbs\/viewthread\.php/i,
            nextLink: '//div[@class="pages"]/descendant::a[@class="next"]'
        },
        {
            siteName: '天极动漫频道新闻',
            url: /http:\/\/comic\.yesky\.com\/\d+\/.+\.shtml/i,
            nextLink: '//div[@id="numpage"]/descendant::a[contains(text(),"下一页")]'
        },
        {
            siteName: '赢政天下论坛帖子内容页面',
            url: /http:\/\/bbs\.winzheng\.com\/viewthread/i,
            nextLink: '//div[@class="forumcontrol"]/descendant::a[@class="next"]'
        },
        {
            siteName: 'soso网页搜索',
            url: /http:\/\/www\.soso\.com\/q/i,
            nextLink: '//div[@id="page"]/descendant::a[last()][@class="next"]'
        },
        {
            siteName: 'bing网页搜索',
            url: /bing\.com\/search\?q=/i,
            nextLink: '//div[@id="results_container"]/descendant::a[last()][@class="sb_pagN"]'
        },
        {
            siteName: '有道网页搜索',
            url: /http:\/\/www\.youdao\.com\/search\?/i,
            nextLink: '//div[@id="pagination"]/descendant::a[last()][@class="next-page"]'
        },
        {
            siteName: '煎蛋首页',
            url: /http:\/\/jandan\.net\/(?:page)?/i,
            nextLink: '//div[@class="wp-pagenavi"]/child::a[text()=">>"]'
        },
        {
            siteName: '中国教程网论坛帖子内容页面',
            url: /http:\/\/bbs\.jcwcn\.com\/thread/i,
            nextLink: '//div[@class="pages"]/descendant::a[@class="next"]'
        },
        {
            siteName: 'kuku动漫',
            url: /http:\/\/comic\.kukudm\.com\/comiclist\/\d+\/\d+.*\.htm/i,
            nextLink: '//a[img[contains(@src,"images/d.gif")]]'
        },
        {
            siteName: 'EZ游戏社区帖子内容页面',
            url: /http:\/\/bbs\.emu-zone\.org\/newbbs\/thread/i,
            nextLink: '//div[@class="p_bar"]/a[contains(text(),"??")]'
        },
        {
            siteName: 'mozest社区帖子内容页面',
            url: /^https:\/\/g\.mozest\.com\/thread/i,
            nextLink: '//div[@class="pages"]/a[@class="next"]'
        },
        {
            siteName: 'mozest社区帖子列表页面',
            url: /^https:\/\/g\.mozest\.com\/forum/i,
            nextLink: '//div[@class="pages"]/a[@class="next"]'
        },
        {
            siteName: '海贼王中文网漫画页',
            url: /http:\/\/op\.52pk\.com\/manhua\/\d+\/\d+/i,
            nextLink: '//li[@id="page__next"]/a[1]'
        },
        {
            siteName: '死神中文网漫画页',
            url: /http:\/\/sishen\.52pk\.com\/manhua\/\d+\/\d+/i,
            nextLink: '//li[@id="page__next"]/a[1]'
        },
        {
            siteName: '火影中文网漫画页',
            url: /http:\/\/narutocn\.52pk\.com\/manhua\/\d+\/\d+/i,
            nextLink: 'li#page__next>a:first-child'
        },
        {
            siteName: '塞班智能手机论坛帖子列表页面',
            url: /http:\/\/bbs\.dospy\.com\/forum/i,
            nextLink: '//div[@class="p_bar"]/a[@class="p_curpage"]/following-sibling::a[@class="p_num"]'
        },
        {
            siteName: '塞班智能手机论坛帖子内容页面',
            url: /http:\/\/bbs\.dospy\.com\/thread/i,
            nextLink: '//div[@class="p_bar"]/a[@class="p_curpage"]/following-sibling::a[@class="p_num"]'
        },
        {
            siteName: '新华网新闻页面',
            url: /http:\/\/news\.xinhuanet\.com\/.+\/\d+-/i,
            nextLink: '//div[@id="div_currpage"]/a[text()="下一页"]'
        },
        {
            siteName: '中关村在线新闻页面',
            url: /http:\/\/(?:[^\.]+\.)?zol.com.cn\/\d+\/\d+/i,
            nextLink: '//a[text()="下一页>"][@href]'
        },
        {
            siteName: '天涯论坛帖子内容页面',
            url: /http:\/\/www\.tianya\.cn\/.+\/content\/.+/i,
            nextLink: '//*[@id="pageDivTop" or @class="pages"]/descendant::a[text()="下一页"][@href]'
        },
        {
            siteName: '色影无忌帖子内容页面',
            url: /http:\/\/forum\.xitek\.com\/showthread/i,
            nextLink: '//font[@size="2"]/font[@class="thtcolor"]/following-sibling::a[@href]'
        },
        {
            siteName: '梦想文学',
            url: /^http:\/\/www\.mx99\.com\/html\/book\/.+html/i,
            nextLink: '//div[@id="thumb"]/a[4]'
        },
        {
            siteName: '招聘区,杭州19楼,帖子内容',
            url: /^http:\/\/www\.19lou\.com\/forum.*thread/i,
            nextLink: '//div[@class="pages"]/descendant::a[text()="下一页"][@href]',
        },
        {
            siteName: '招聘区,杭州19楼,帖子列表',
            url: /^http:\/\/www\.19lou\.com\/forum/i,
            nextLink: '//div[@class="pages"]/descendant::a[text()="下一页"][@href]'
        },
        {
            siteName: '汽车之家论坛帖子内容',
            url: /^http:\/\/club\.autohome\.com\.cn\/bbs\/thread/i,
            nextLink: '//div[@class="pages"]/a[@title="下1页"][@href]'
        },
        {
            siteName: '爱卡汽车论坛帖子内容',
            url: /^http:\/\/www\.xcar\.com\.cn\/bbs\/viewthread/i,
            nextLink: '//a[text()="下一页＞"][@href]'
        },
        {
            siteName: '猫扑大杂烩帖子内容',
            url: /http:\/\/dzh\.mop\.com\/topic\/readSub/i,
            nextLink: '//a[contains(text(),"下一页")][@href]'
        },
        {
            siteName: '水木社区帖子内容页面',
            url: /http:\/\/www\.newsmth\.net\/bbstcon/i,
            nextLink: '//a[text()="下一页"][@href]',
        },
        {
            siteName: 'VeryCD搜索页面',
            url: /http:\/\/www\.verycd\.com\/search\/folders.+/i,
            nextLink: '//div[@class="pages-nav"]/a[contains(text(),"下一页")][@href]'
        },
        {
            siteName: '178在线漫画',
            url: /http:\/\/manhua\.178\.com\/.+\/.+\/.+/i,
            loaded: true,
            nextLink: '//div[@class="pages"]/a[text()="下一页"][@href]'
        },
        {
            siteName: 'flickr搜索',
            url: /http:\/\/www\.flickr\.com\/search\/\?q=/i,
            nextLink: '//div[@class="Paginator"]/a[@class="Next"][@href]'
        },
        {
            siteName: '搜狗浏览器论坛帖子页面',
            url: /http:\/\/ie\.sogou\.com\/bbs\/forumdisplay\.php/i,
            nextLink: '//div[@class="pages"]/a[@class="next"][@href]'

        },
        {
            siteName: '搜狗浏览器论坛帖子内容页面',
            url: /http:\/\/ie\.sogou\.com\/bbs\/viewthread\.php/i,
            nextLink: '//div[@class="pages"]/a[@class="next"][@href]'

        },
        {
            siteName: '小说梦阅读页',
            url: /http:\/\/www\.xiaoshuomeng\.com\/book\/.+\/zhangjie\/.+/i,
            nextLink: '//a[text()="下一章"][@href]'
        },
        {
            siteName: '和讯博客',
            url: /blog\.hexun\.com/i,
            nextLink: '//a[text()="下一页"]',
            preLink: '//a[text()="上一页"]'
        },
        {
            siteName: '百书库',
            url: /baishuku\.com/i,
            nextLink: '//a[text()="下一页(快捷键:→)"]',
            preLink: '//a[text()="(快捷键:←)上一页"]'
        },
        {
            siteName: '海报网',
            url: /haibao\.cn/i,
            nextLink: '//a[@class="right tright"]',
            preLink: '//a[@class="left tleft"]'
        },
        {
            siteName: "凤凰网",
            url: /ifeng\.com.*\/(bigpicture|hdsociety)\/detail_/i,
            nextLink: function ()
            {
                content.location.href = content.wrappedJSObject.nextLink;
            },
            preLink: function ()
            {
                content.location.href = content.wrappedJSObject.preLink;
            }
        },
        {
            siteName: "凤凰网",
            url: /ifeng\.com.*\/detail_/i,
            nextLink: "//a[@id='nextLink']",
            preLink: "//a[@id='preLink']"
        },
        {
            siteName: "瘾科技",
            url: /cn\.engadget\.com/i,
            nextLink: "//a[text()='Next 20 Comments']",
            preLink: "//a[text()='Previous 20 Comments']"
        },
        {
            siteName: "xda",
            url: /forum\.xda-developers\.com\/showthread\.php\?/i,
            nextLink: "//a[@rel='next']",
            preLink: "//a[@class='pagination-prev']"
        },
        {
            siteName: "android market",
            url: /play\.google\.com/i,
            nextLink: "//div[contains(@class,'num-pagination-next')]",
            preLink: "//div[contains(@class,'num-pagination-previous')]"
        },
        {
            siteName: "163 图片新闻",
            url: /news\.163\.com\/photoview\//i,
            nextLink: "//a[@id='photoNext']",
            preLink: "//a[@id='photoPrev']"
        },
        {
            siteName: "126/163/yeah 邮箱",
            url: /webmail\.mail\.(126\.com|163\.com|yeah\.net)/i,
            nextLink: "//div[@id='dvContainer']/div[last()]//div[@title='下一页']",
            preLink: "//div[@id='dvContainer']/div[last()]//div[@title='上一页']"
        },
        {
            siteName: "addons.mozilla.org",
            url: /addons\.mozilla\.org/i,
            nextLink: "//a[@class='button next']",
            preLink: "//a[@class='button prev']"
        },
        {
            siteName: "亚马逊",
            url: /amazon\.cn/i,
            nextLink: "//a[@id='pagnNextLink']",
            preLink: "//a[@id='pagnPrevLink']"
        },
        {
            siteName: "网易博客",
            url: /blog\.163\.com\/blog/i,
            nextLink: "//span[contains(.,'下一页')]",
            preLink: "//span[contains(.,'上一页')]"
        }];

    var next = {};
    var previous = {};

    // “下一页”链接中的文字。
    next.texts = [
        'next',
        'next page',
        'old',
        'older',
        'earlier',
        '下页',
        '下頁',
        '下一頁',
        '后一页',
        '后一頁',
        '翻下页',
        '翻下頁',
        '后页',
        '后頁',
        '下翻',
        '下一个',
        '下一张',
        '下一幅',
        '下一节',
        '下一章',
        '下一篇',
        '后一章',
        '后一篇',
        '往后',
        "Next photo",
        '下一页',
        '下1页',
        '下1頁',
        'newer entries',
        '次へ',
        ''
    ];

    // “上一页”链接中的文字。
    previous.texts = [
        'previous',
        'prev',
        'previous page',
        'new',
        'newer',
        'later',
        '上页',
        '上頁',
        '上一页',
        '上一頁',
        '前一页',
        '前一頁',
        '翻上页',
        '翻上頁',
        '前页',
        '前頁',
        '上翻',
        '上一个',
        '上一张',
        '上一幅',
        '上一节',
        '上一章',
        '上一篇',
        '前一章',
        '前一篇',
        '往前',
        'Previous photo',
        '上1页',
        '上1頁',
        'older entries',
        '前へ',
        ''
    ];

    // 可能会误判的词。
    next.continueTexts = ["next", ">>", "»"];
    previous.continueTexts = ["previous", "<<", "«"];

    // 链接或其他标签的属性,比如id,class,title之类使用的
    next.attrValue = /^(next(link)?|linknext|pgdown)$/i;
    previous.attrValue = /^(prev(ious)?(link)?|linkprev(ious)?|pgup)$/i;

    // 翻页文字的前面和后面可能包含的字符,
    next.startRegexp = /(?:^\s*(?:[\(\[『「［【]?)\s*)/;
    next.endRegexp = /(?:\s*([＞>›»]*)|(?:[\)\]』」］】→]?)\s*$)/;

    previous.startRegexp = /(?:^\s*([＜<‹«]*)|(?:[\(\[『「［【←]?)\s*)/;
    previous.endRegexp = /(?:\s*(?:[\)\]』」］】]?)\s*$)/;

    var current = null;
    const discuzRegexp = /\/forumdisplay\.php\?fid=\d+/i;
    const emptyRegexp = /^\s$/;

    // 检查字符串是否为空。
    function _isEmpty(str)
    {
        if (!str)
        {
            return true;
        }

        if (emptyRegexp.test(str))
        {
            return true;
        }

        return false;
    }

    // 有些操作,比如事件等,必须用沙箱方式才行。
    function _getUnsafeWindow(p_content)
    {
        p_content = p_content || content;
        let sandbox = Cu.Sandbox(p_content);
        sandbox.unsafeWindow = p_content.wrappedJSObject;
        return sandbox.unsafeWindow;
    }

    //检查站点的地址是否和列表匹配
    function _isMatch(e, index, array)
    {
        return e.test(_getCurrentHref(this))
    }

    /**
     * 当前页面/给定窗口的链接
     */
    function _getCurrentHref(p_content)
    {
        p_content = p_content || content;
        return p_content.document.location.href;
    }

    /**
     * 清理临时存储的变量。
     */
    function _cleanVariable()
    {
        try
        {
            current = null;
            next.link = next.found = next.digital = null;
            next.content = next.dir = null;
            previous.link = previous.found = null;
            previous.content = previous.dir = null;
        }
        catch (e)
        { }
    }

    /**
     * 更新变量。
     */
    function _updateCurrent(item, p_content, notFound)
    {
        current.link = item;
        current.found = !notFound;
        current.content = p_content;
    }

    /**
     * 检查特殊链接。
     */
    function _checkDefinedNext(p_content, p_recursive)
    {
        p_content = p_content || content;
        let doc = p_content.document;

        // 明确的地址。
        let search = function (p_array)
        {
            for (let i = 0; i < p_array.length; i++)
            {
                if (doc.location.href.match(p_array[i].url))
                {
                    let xpath = p_array[i][current.dir];

                    if (typeof (xpath) == "function" && p_recursive)
                    {
                        // 如果是函数，直接执行就相当于翻页。
                        _cleanVariable();
                        xpath();
                        return -1;
                    }
                    else
                    {
                        // 如果不存在规则，返回。
                        if (!xpath || emptyRegexp.test(xpath))
                        {
                            return 0;
                        }

                        // 匹配规则，寻找“下一页（上一页）”的链接。
                        let link = doc.evaluate(xpath, doc, null, 9, null).singleNodeValue;
                        if (!link)
                        {
                            continue;
                        }

                        current.link = link;
                        current.found = true;
                        current.content = p_content;
                        return 1;
                    }
                }
            }
        };

        if (search(rule.specialSites) || search(rule.specialCommon))
        {
            return 1;
        }

        // 检查子窗口。
        if (p_recursive)
        {
            let f = p_content.frames;
            for (let i = 0; i < f.length; i++)
            {
                let c = _checkDefinedNext(f[i]);
                if (c == 1 || c == -1)
                {
                    return c;
                }
            }
        }
    }

    function _checkNext(p_content)
    {
        p_content = p_content || content;

        // 检查链接。
        _checkLinks(p_content);
        if (current.found)
        {
            return;
        }

        // 检查按钮。
        _checkTags(p_content, "INPUT");
    }

    /**
     * 检查INPUT等元素。
     */
    function _checkTags(p_content, tag)
    {
        let items = p_content.document.getElementsByTagName(tag);
        let item, text;
        for (let i = 0; i < items.length; i++)
        {
            item = items[i];
            if (!_isValid(item))
            {
                continue;
            }

            if (tag == "INPUT")
            {
                //按钮的话,检查value属性
                text = item.value;
            }
            else
            {
                //其他标签,就检查内容
                text = item.innerHTML;
            }

            if (current.fullRegExp.test(text))
            {
                if (RegExp.$1 == "" && RegExp.$2 == "")
                {
                    continue;
                }

                if (current.continueTexts.indexOf(RegExp.$2.toLowerCase()) == -1 &&
                    current.continueTexts.indexOf(RegExp.$1.toLowerCase()) == -1)
                {
                    _updateCurrent(item, p_content);
                    return;
                }
                else if (!isTempFound)
                {
                    isTempFound = true;
                    _updateCurrent(item, p_content, true);
                }
            }
        }
    }

    function _checkLinks(p_content)
    {
        let items = p_content.document.getElementsByTagName("A");
        let item, text, value;
        let isTempFound = 0;
        for (let i = 0; i < items.length; i++)
        {
            item = items[i];
            if (!_isValid(item, p_content))
            {
                continue;
            }

            // textContent 加了title会不会有问题?
            text = item.textContent || item.title;

            // inner img
            if (_isEmpty(text))
            {
                let imgs = item.children;
                for (let i = 0; i < imgs.length; i++)
                {
                    if (imgs[i].nodeName != "IMG")
                    {
                        continue;
                    }

                    text = imgs[i].title || imgs[i].alt;
                    if (!_isEmpty(text))
                    {
                        break;
                    }
                }
            }

            if (_isEmpty(text))
            {
                continue;
            }

            if (NumberUtil.isDigital(text) && (isTempFound == 0) &&
                (current.dir == "nextLink" || current.dir == "preLink"))
            {
                // 可能会误判,所以继续检测
                let linkNumber = parseInt(RegExp.$1);
                let type = (current.dir == "nextLink") ? -1 : 1;
                let node = NumberUtil.getPageNode(item, linkNumber, type, p_content.document);
                if (node)
                {
                    isTempFound = 1;

                    //检测出来结果之后,并不结束,继续检查其他的连接,如果在没有其他的结果,才使用现在的这个
                    _updateCurrent(item, p_content, true);
                }
            }
            else
            {
                if (current.fullRegExp.test(text))
                {
                    if (RegExp.$1 == "" && RegExp.$2 == "")
                    {
                        continue;
                    }

                    // 可能的误判问题，$1可以得到实际匹配的结果
                    if (current.continueTexts.indexOf(RegExp.$2.toLowerCase()) == -1 &&
                        current.continueTexts.indexOf(RegExp.$1.toLowerCase()) == -1)
                    {
                        _updateCurrent(item, p_content);
                        return;
                    }
                    else if (isTempFound < 2)
                    {
                        isTempFound = 2;
                        _updateCurrent(item, p_content, true);
                    }
                    // 这里似乎还是有问题啊，只能保存一次，不过获取到两次以上可能出错结果的情况应该不会太多吧。
                }
            }
        }

        // 将之前记录的通过翻页计算的结果作为最终的结果
        if (!current.found && isTempFound)
        {
            current.found = true;
            return;
        }
    }

    /**
     * 判断元素是否有效，比如隐藏的，就被认为是无效的。
     */
    function _isValid(e, p_content)
    {
        // localname在3.5和之后的版本中是不一致的,为了避免这个问题,使用nodeName
        if (e.nodeName == "A")
        {
            // 如果不是当前域,跳过
            if (/^https?:/i.test(e.href) && e.hostname != p_content.location.hostname)
            {
                return false;
            }

            // 有这个必要吗
            if (e.href && !/^\s*$|^https?:|^javascript:|^file:/i.test(e.href))
            {
                return false;
            }

            // 跳过不起作用的链接
            if (!e.offsetParent || e.offsetWidth == 0 || e.offsetHeight == 0 ||
                (!e.hasAttribute("href") && !e.hasAttribute("onclick")))
            {
                return false;
            }

            // 跳过日历
            if (/(?:^|\s)(?:monthlink|weekday|day|day[\-_]\S+)(?:\s|$)/i.test(e.className))
            {
                return false;
            }

            return true;
        }
        else if (e.nodeName == "IMG")
        {
            // TODO: 对图像的初步的排查
            return true;
        }
        else if (e.nodeName == "INPUT")
        {
            if (e.disabled || (e.type != "button" && e.type != "submit"))
            {
                return false;
            }
            return true;
        }
        else
        {
            //暂时没有用到
            try
            {
                return e.style.display != "none";
            }
            catch (e)
            {
                return false;
            }
        }
    }

    function _checkNextInIframe(frame)
    {
        if (frame)
        {
            _checkNext(frame);
        }
        else
        {
            let frames = content.frames;
            for (let i = 0; i < frames.length; i++)
            {
                _checkNext(frames[i])
                if (current.found)
                {
                    return;
                }
            }
        }
    }

    var NumberUtil = new function ()
    {
        // 取得相邻的纯数字节点，type: 1 下一个；-1 上一个
        function getSiblingNode(node, type)
        {
            if (!node) return null;
            node = getSibling(node, type);
            while (node && (node.nodeName == "#coment" ||
                (/^\s*[\]］】]?[,\|]?\s*[\[［【]?\s*$/.test(node.textContent))))
            {
                node = getSibling(node, type);
            }
            return node;
        }

        function getSibling(aNode, type)
        {
            if (!aNode) return null;
            if (isOnlyNode(aNode))
            {
                try
                {
                    aNode = (type == 1 ?
                        aNode.parentNode.nextSibling :
                        aNode.parentNode.previousSibling);
                    if (skipNode(aNode))
                    {
                        aNode = (type == 1 ? aNode.nextSibling : aNode.previousSibling);
                    }

                    aNode = aNode.childNodes[0];
                    if (skipNode(aNode))
                    {
                        aNode = aNode.nextSibling;
                    }
                }
                catch (e)
                {
                    return null;
                }
            }
            else
            {
                aNode = (type == 1 ? aNode.nextSibling : aNode.previousSibling);
            }
            return aNode;
        }

        function isOnlyNode(n)
        {
            return !n.nextSibling && !n.previousSibling ||
                !n.nextSibling && skipNode(n.previousSibling) &&
                !n.previousSibling.previousSibling ||
                !n.previousSibling && skipNode(n.nextSibling) &&
                !n.nextSibling.nextSibling || skipNode(n.previousSibling) &&
                !n.previousSibling.previousSibling && skipNode(n.nextSibling) &&
                !n.nextSibling.nextSibling;
        }

        function skipNode(sNode)
        {
            return sNode && (/^\s*$/.test(sNode.textContent));
        }

        // 检测是否有下一页的纯数字链接，number:页数
        function getNextLink(node, number, aSet)
        {
            var tNode = getSiblingNode(node, 1);
            if (tNode && tNode.nodeName == "A" &&
                this.isDigital(tNode.textContent))
            {
                if (RegExp.$1 == number)
                {
                    // 找到纯数字链接
                    if (aSet)
                    {
                        next.link = tNode;
                        next.found = true;
                    }
                    return tNode;
                }
            }
            return null;
        }

        this.isDigital = function (str, t)
        {
            str = str.replace(/^\s+|\s+$/g, "");
            if (t == -1)
            {
                str = str.split(/\s+/).pop();
            }
            else if (t == 1)
            {
                str = str.split(/\s+/)[0];
            }
            return (/^(\d+)$/.test(str)) ||
                (/^\[\s?(\d+)\s?\]$/.test(str)) ||
                (/^【\s?(\d+)\s?】$/.test(str)) ||
                (/^［\s?(\d+)\s?］$/.test(str)) ||
                (/^<\s?(\d+)\s?>$/.test(str)) ||
                (/^＜\s?(\d+)\s?＞$/.test(str)) ||
                (/^『\s?(\d+)\s?』$/.test(str)) ||
                (/^「\s?(\d+)\s?」$/.test(str)) ||
                (/^第\s?(\d+)\s?页$/.test(str));
        }

        // 判断是否是当前页面的数字，type:-1,0,1 分别是要判别的上一个、当前、下一个节点
        this.getPageNode = function (node, linkNum, type, doc)
        {
            var tNode;
            if (type == 0)
            {
                tNode = getSiblingNode(node, 1) || getSiblingNode(node, -1);
                if (!tNode)
                {
                    return null;
                }

                if (!node.hasAttribute("onclick") &&
                    node.href != tNode.href &&
                    (!node.hasAttribute("href") &&
                        this.isDigital(node.textContent, type) ||
                        !(/\/#[^\/]+$/.test(node.href)) &&
                        node.href == doc.location.href &&
                        this.isDigital(node.textContent, type)))
                {
                    if (linkNum > 0 && RegExp.$1 == linkNum)
                    {
                        return node;
                    }
                }
                // 某些论坛处在第一页时，实际链接和当前页链接不符，只有和其余纯数字链接的结构或颜色不同时，
                // 才使用纯数字的“2”作为“下一页”的链接。
                else if (!next.digital &&
                    (/^\s*[\[［【]?1[\]］】]?\s*$/.test(node.textContent)))
                {
                    var two = getNextLink(node, 2);
                    if (two && difDigital(node, two, doc))
                    {
                        next.digital = two;
                    }
                }
            }
            else
            {
                tNode = getSiblingNode(node, type);
                if (!tNode) return null;
                if (tNode.nodeName != "A" &&
                    this.isDigital(tNode.textContent, type) ||
                    tNode.nodeName == "A" && !tNode.hasAttribute("onclick") &&
                    node.href != tNode.href && (!tNode.hasAttribute("href") &&
                        this.isDigital(tNode.textContent, type) ||
                        !(/\/#[^\/]+$/.test(tNode.href)) &&
                        tNode.href == doc.location.href &&
                        this.isDigital(tNode.textContent, type)))
                {
                    var n = linkNum + type;
                    if (n > 0 && RegExp.$1 == n)
                    {
                        if (next.digital)
                        {
                            next.digital = null;
                        }
                        return tNode;
                    }
                }
            }
            return null;
        }

        function difDigital(node1, node2, doc)
        {
            if (getStructure(node1) == getStructure(node2) &&
                getStyleColor(node1, doc) == getStyleColor(node2, doc))
            {
                return false;
            }
            return true;
        }

        function getStructure(aNode)
        {
            return aNode.innerHTML.replace(/\d+/, "");
        }

        function getStyleColor(aNode, doc)
        {
            // 得到得到的是最终的样式
            return doc.defaultView.getComputedStyle(aNode, null).getPropertyValue("color");
        }
    };

    /**
     * 打开链接。
     */
    function _openLink()
    {
        let p_content = current.content;
        let linkNode = current.link;

        _fix4Discuz();

        // 设置翻页间隔。
        config.key_pressed = true;
        setTimeout(function ()
        {
            config.key_pressed = false;
        }, config.key_freeze_time);

        if (isGoAsLink())
        {
            //直接打开链接的方式,这种方式之所以优先,是可能会利用到history
            if (_loadFromHistory())
            {
                return;
            }
            else
            {
                _cleanVariable();
                p_content.document.location.assign(linkNode.href);
            }
        }
        else
        {
            _cleanVariable();
            if (config.isFix4FG)
            {
                setTimeout(function ()
                {
                    linkNode.click();
                }, 350)
            }
            else
            {
                linkNode.click();
            }
        }
    }

    /**
     *  从历史纪录快速加载已经访问过的页面。
     */
    function _loadFromHistory()
    {
        let link = current.link;
        let histories = gBrowser.sessionHistory;
        for (let i = 0; i < histories.count; i++)
        {
            let uri = histories.getEntryAtIndex(i, true).QueryInterface(Ci.nsISHEntry);
            if (uri.URI.spec == link.href ||
                _fix4History(uri.URI.spec, link.href))
            {
                gBrowser.gotoIndex(i);
                _cleanVariable();
                return true;
            }
        }
        return false;
    }

    //调整一些url的匹配,去掉一些随机的参数之类的,能够更好的利用到历史记录
    function _fix4History(href1, href2)
    {
        //google 搜索修正,因为会加入随机的参数,导致无法使用history
        if (/www\.google\.com(\.hk|\.cn)?\/search\?/i.test(href2))
        {
            //这两个都是随机的的值,每次搜索都是不一样的结果
            let h1 = href1.replace(/&ei=\w*&|&hs=\w*&/ig, "&");
            let h2 = href2.replace(/&ei=\w*&|&hs=\w*&/ig, "&");
            if (h1 == h2)
            {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断是否按照普通链接的方式来执行,返回false的话就使用模拟点击的方式处理
     */
    function isGoAsLink()
    {
        let linkNode = current.link;
        if (linkNode.nodeName != "A")
        {
            return false;
        }

        let href = linkNode.getAttribute("href");
        let referrer = _getCurrentHref(current.content);

        //强制使用模拟点击的
        if (rule.forceClick.some(_isMatch, current.content))
        {
            return false;
        }

        //href属性不存在或者无效的情况
        if (!href)
        {
            return false;
        }

        if (emptyRegexp.test(href))
        {
            return false;
        }

        //包括javascript处理
        if (linkNode.hasAttribute("onclick"))
        {
            return false;
        }

        //todo 这里似乎是有问题的
        // if (href.indexOf("javascript:void(0)") == 0)return false;
        if (href.indexOf("javascript:") == 0)
        {
            return false;
        }

        //如果链接于当前页面地址相同,必定是有js的处理,当然,也可能就是当前页面
        if (referrer && href == referrer)
        {
            return false;
        }

        if (href == "#")
        {
            return false;
        }

        if (!linkNode.target || /^\s*$|^_?(blank|self)$/.test(linkNode.target))
        {
            //链接在当前窗口
        }
        else if (/^_?(parent|top)$/.test(linkNode.target))
        {
            //寻找到目标窗口
            current.content = current.content[RegExp.$1];
        }
        //再找不到就是自定的窗口了,这个就不必处理,改为使用模拟点击的方式
        else
        {
            //当然,可以再找到目标窗口,不过这样做没有什么必要,因为不是top窗口,也无法利用到历史记录的
            return false;
        }
        return true;
    }

    /**
     * 修改页面，保证在使用方向键的时候，Discuz页面正常。
     */
    function _fix4Discuz()
    {
        if (config.isFix4Discuz)
        {
            if (_getCurrentHref(content).match(discuzRegexp))
            {
                _getUnsafeWindow(content).document.onkeyup = null;
            }
        }
    }

    /*
     * 合并正则。
     */
    function _combineRegExp(next)
    {
        next.fullRegExp = new RegExp(
            next.startRegexp.toString().slice(1, -1) +
            "(" + next.texts.join("|") + ")" +
            next.endRegexp.toString().slice(1, -1),
            'i'
        );
    }

    this.next = function (p_reverse)
    {
        try
        {
            // 当前获得“鼠标光标”的元素。
            let element = content.document.activeElement;
            if (element.isContentEditable == true)
            {
                return;
            }

            if (element.contentEditable == "true")
            {
                return;
            }

            if (element.localName == "iframe" &&
                element.contentWindow.document.body.contentEditable == "true")
            {
                return;
            }
        }
        catch (e)
        { }

        if (config.key_pressed)
        {
            return;
        }

        current = p_reverse ? previous : next;
        current.dir = p_reverse ? "preLink" : "nextLink";

        //检查特殊窗口。
        let c = _checkDefinedNext(undefined, true);
        if (c == 1)
        {
            _openLink();
            return;
        }
        else if (c == -1)
        {
            return;
        }

        if (!current.found)
        {
            _checkNext();
        }

        if (current.found)
        {
            _openLink();
        }
        else
        {
            _checkNextInIframe();
            if (current.found)
            {
                _openLink();
            }
        }
    };

    this.prev = function ()
    {
        this.next(true);
    };

    this.init = function ()
    {
        if (document.location.href == "chrome://browser/content/browser.xul")
        {
            // 合并正则。
            _combineRegExp(next);
            _combineRegExp(previous);

            // 绑定快捷键。
            if (config.key_enable)
            {
                if (config.key_next == "VK_RIGHT" &&
                    config.key_prev == "VK_LEFT")
                {
                    config.isFix4Discuz = true;
                }

                let keyset = document.createElement("keyset");
                keyset.setAttribute("id", "nextpage-keyset");

                let keyNext = keyset.appendChild(document.createElement("key"));
                let keyPrev = keyset.appendChild(document.createElement("key"));

                keyNext.setAttribute("oncommand", "nextPage.next();");
                keyPrev.setAttribute("oncommand", "nextPage.prev();");

                keyNext.setAttribute("keycode", config.key_next);
                keyPrev.setAttribute("keycode", config.key_prev);

                let insPos = document.getElementById("mainPopupSet");
                insPos.parentNode.insertBefore(keyset, insPos);
            }

            window.nextPage = nextPage;
        }
    };
};

nextPage.init();
