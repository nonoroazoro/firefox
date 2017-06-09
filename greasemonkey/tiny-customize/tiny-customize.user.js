// ==UserScript==
// @name        Tiny-Customize
// @description 为常用网站添加功能定制。例如：3DMGame、贴吧、淘宝、京东、GitHub...
// @homepageURL https://github.com/nonoroazoro/firefox/tree/master/greasemonkey/tiny-customize
// @namespace   https://greasyfork.org/zh-CN/scripts/19823-tiny-customize
// @author      nonoroazoro
// @include     /^https?:\/\/(.+\.)?github\./
// @include     http://bbs.3dmgame.com/*
// @include     http://bbs.kafan.cn/*
// @include     http://forum.gamer.com.tw/*
// @include     http://poedb.tw/dps*
// @include     http://tieba.baidu.com/*
// @include     https://forum.gamer.com.tw/*
// @include     https://login.taobao.com/*
// @include     https://passport.jd.com/*
// @include     https://www.chiphell.com/*
// @version     1.2.5
// @grant       none
// ==/UserScript==

const host = window.location.host;
const href = window.location.href;

/**
 * 获取立即执行的操作。
 */
const getInstantActions = () =>
{
    const actions = [];

    if (host === "forum.gamer.com.tw")
    {
        // 巴哈姆特。

        // 反反广告检测。
        actions.push(() =>
        {
            if (window.AntiAd)
            {
                window.AntiAd.check = _noop;
                window.AntiAd.block = _noop;
                window.AntiAd.verifyLink = () => false;
            }
        });
    }
    else if (
        host === "bbs.kafan.cn" ||
        host === "bbs.3dmgame.com" ||
        host === "www.chiphell.com"
    )
    {
        // 卡饭、3DMGame、Chiphell 论坛（Discuz 驱动的论坛）。

        // 屏蔽方向键翻页。
        actions.push(() =>
        {
            if (window.keyPageScroll)
            {
                window.keyPageScroll = _noop;
            }
        });
    }
    else if (/^https?:\/\/poedb\.tw(\/?.*)\/dps/.test(href))
    {
        // 流亡编年史。

        // 屏蔽默认自动全选物品信息、自动查询物品信息。
        actions.push(() =>
        {
            const elem = document.querySelector(`#iteminfo`);
            const form = document.querySelector(`form[action^="dps"]`);
            elem.addEventListener("click", e => e.stopPropagation(), true);
            elem.addEventListener("keydown", (e) =>
            {
                if (e.key === "Enter")
                {
                    form.submit();
                    e.preventDefault();
                }
            });

            elem.addEventListener("paste", (e) =>
            {
                setTimeout(() => form.submit(), 0);
            });
        });
    }
    else if (host === "login.taobao.com")
    {
        // 淘宝。

        // 默认显示密码登录（而非 QR 码登录）界面。
        actions.push(() =>
        {
            // 始终显示密码登录。
            let elems = document.querySelectorAll(`.static-form, .iconfont.static`);
            elems.forEach(e => e.setAttribute("style", "display: block !important"));

            // 删除扫码登录。
            elems = document.querySelectorAll(`.login-switch, .login-tip, .iconfont.quick, .quick-form`);
            elems.forEach(e => e.remove());
        });
    }
    else if (host === "passport.jd.com")
    {
        // 京东。

        // 默认显示密码登录（而非 QR 码登录）界面。
        actions.push(() =>
        {
            // 删除扫码登录。
            let elems = document.querySelectorAll(`.login-tab, .login-box > .mt.tab-h, .qrcode-login, #qrCoagent`);
            elems.forEach(e => e.remove());

            // 始终显示密码登录。
            elems = document.querySelectorAll(`.login-box, #entry`);
            elems.forEach(e => e.setAttribute("style", "display: block !important; visibility: visible !important;"));
        });
    }
    else if (/^(.+\.)?github\./.test(host))
    {
        // GitHub。

        // 禁用快捷键: "s"，"w"。
        _disableKeydown("s w");
    }

    return actions;
};

/**
 * 获取延迟执行的操作。
 */
const getLazyActions = () =>
{
    const actions = [];

    if (host === "forum.gamer.com.tw")
    {
        // 巴哈姆特。

        // 自动开启图片。
        actions.push(() =>
        {
            if (window.forumShowAllMedia)
            {
                window.forumShowAllMedia();
            }
        });
    }
    else if (host === "tieba.baidu.com")
    {
        // 贴吧。

        // 删除广告贴。
        actions.push(() =>
        {
            let spans;
            const elems = document.querySelectorAll(`#j_p_postlist > div`);
            elems.forEach((e) =>
            {
                spans = e.querySelectorAll(`.core_reply_tail span`);
                for (const s of spans)
                {
                    if (s.innerText.trim() === "商业推广")
                    {
                        e.remove();
                        break;
                    }
                }
            });
        });
    }

    return actions;
};

/**
 * 立即执行指定的操作。
 */
const exec = (p_actions) =>
{
    p_actions.forEach(p_action => p_action());
};

// 1. 立即执行。
exec(getInstantActions());

// 2. 延迟执行。
window.addEventListener("load", () => exec(getLazyActions()), true);

function _noop() { }

/**
 * 禁止键盘快捷键（单键）。
 */
function _disableKeydown(p_keys)
{
    if (typeof p_keys === "string")
    {
        const keys = p_keys.split(/\W+/);
        document.addEventListener("keydown", (e) =>
        {
            if (keys.indexOf(e.key.toLowerCase()) !== -1)
            {
                e.stopPropagation();
            }
        }, true);
    }
}
