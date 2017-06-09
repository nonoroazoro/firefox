// ==UserScript==
// @name            rZhihu
// @author          nonoroazoro
// @description     为知乎首页添加类似 Google Reader 的快捷键。
// @description:en  Add Google-like keyboard shortcuts for Zhihu homepage.
// @homepageURL     https://raw.githubusercontent.com/nonoroazoro/firefox/master/greasemonkey/rZhihu/rZhihu.user.js
// @namespace       https://greasyfork.org/zh-CN/scripts/30036-rzhihu
// @grant           none
// @version         1.0.5
// @run-at          document-end
// @include         https://www.zhihu.com/
// ==/UserScript==

const ignoreList = ["INPUT", "DIV", "TEXTAREA"];
let currentIndex = 0;
let inProgress = false;
let maxIndex = -1;
let stories = null;
let storyContainer = null;

function start()
{
    storyContainer = document.querySelector(".TopstoryMain");
    observe(storyContainer, update);
    document.body.addEventListener("keydown", _keydownHandler);
}

function _keydownHandler(e)
{
    if (!stories || ignoreList.indexOf(e.target.nodeName) !== -1 || e.altKey || e.shiftKey || e.ctrlKey || e.metaKey)
    {
        return;
    }

    if (e.keyCode === 74)
    {
        // press "j"
        _next();
    }
    else if (e.keyCode === 75)
    {
        // press "k"
        _prev();
    }
    else if (e.keyCode === 79 || e.keyCode === 13)
    {
        // press "o/enter"
        _toggle();
    }
    else if (e.keyCode === 85)
    {
        // press "u"
        _unlike();
    }
}

/**
 * flip to next story.
 */
function _next()
{
    _flip(currentIndex + 1);
}

/**
 * flip to previous story.
 */
function _prev()
{
    _flip(currentIndex - 1);
}

/**
 * flip to story.
 */
function _flip(index)
{
    if (!inProgress)
    {
        inProgress = true;

        let targetIndex = index;
        if (targetIndex < 0)
        {
            targetIndex = 0;
        }

        if (targetIndex > maxIndex)
        {
            targetIndex = maxIndex;
        }

        const target = stories[targetIndex];
        if (target)
        {
            if (targetIndex !== currentIndex)
            {
                stories[currentIndex].style.borderColor = "#E7EAF1";
            }
            currentIndex = targetIndex;
            target.style.borderColor = "#A4D2F8";

            window.scrollTo(0, target.offsetTop);
        }

        inProgress = false;
    }
}

/**
 * toggle story expand/collapse.
 */
function _toggle()
{
    const story = stories[currentIndex];
    const expand = story.querySelector(".is-collapsed .RichContent-inner");
    if (expand)
    {
        expand.click();
    }
    else
    {
        const collapse = story.querySelector(".ContentItem-actions > button:last-child");
        collapse.click();
    }
}

/**
 * toggle story unlike.
 */
function _unlike()
{
    const story = stories[currentIndex];
    const unlike = story.querySelector("button:first-child");
    unlike.click();
}

/**
 * update after the original zhihu story list is loaded.
 */
function update(mutations)
{
    if (mutations.length > 0)
    {
        try
        {
            const index = JSON.parse(storyContainer.dataset["zaModuleInfo"])["list"]["list_size"] - 1;
            if (index !== maxIndex)
            {
                maxIndex = index;
                stories = document.querySelectorAll(".Card.TopstoryItem");
            }
        }
        catch (e)
        {
            const index = storyContainer.children.length - 1;
            if (index !== maxIndex)
            {
                maxIndex = index;
                stories = storyContainer.children;
            }
        }
    }
}

function observe(element, callback)
{
    if (element && typeof callback === "function")
    {
        (new window.MutationObserver(debounce(callback))).observe(element, {
            attributes: true,
            attributeFilter: ["data-za-module-info"]
        });
    }
}

function debounce(callback, delay = 500)
{
    let timer = null;
    return function (...args)
    {
        const context = this;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => callback.apply(context, args), delay);
    };
}

/**
 * check if run-at is working correctly.
 */
function isRunAtAvailabe()
{
    let available = false;
    if (typeof GM_info === "undefined")
    {
        available = true;
    }
    else
    {
        available = GM_info.scriptHandler === "Tampermonkey";
    }
    return available;
}

if (isRunAtAvailabe())
{
    start();
}
else
{
    document.addEventListener("DOMContentLoaded", () => start());
}
