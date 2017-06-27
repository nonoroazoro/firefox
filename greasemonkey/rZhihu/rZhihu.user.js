// ==UserScript==
// @name            rZhihu
// @author          nonoroazoro
// @description     为知乎首页添加类似 Google Reader 的快捷键。
// @description:en  Adding Google-like keyboard shortcuts for Zhihu homepage.
// @homepageURL     https://github.com/nonoroazoro/firefox/tree/master/greasemonkey/rZhihu
// @namespace       https://greasyfork.org/zh-CN/scripts/30036-rzhihu
// @grant           none
// @version         1.1.1
// @run-at          document-end
// @include         https://www.zhihu.com/
// @include         https://www.zhihu.com/#*
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
    storyContainer.addEventListener("click", _clickHandler);
    document.body.addEventListener("keydown", _keydownHandler);
}

function _clickHandler(e)
{
    // highlight the clicked story.
    const index = _getIndexOfStory(_getAncestor(e.target, "TopstoryItem"));
    if (index !== -1)
    {
        _flip(index, false);
    }
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
    else if (e.keyCode === 67)
    {
        // press "c"
        _toggleComment();
    }
    else if (e.keyCode === 85)
    {
        // press "u"
        _unlike();
    }
    else if (e.keyCode === 86)
    {
        // press "v"
        _openInNewTab();
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
 *
 * @param {number} index
 * @param {boolean} [ensureVisible=true]
 */
function _flip(index, ensureVisible = true)
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

            if (ensureVisible)
            {
                window.scrollTo(0, target.offsetTop);
            }
        }

        inProgress = false;
    }
}

/**
 * toggle story expand/collapse.
 */
function _toggle()
{
    const expand = _query(".is-collapsed .RichContent-inner");
    if (expand)
    {
        expand.click();
    }
    else
    {
        const collapse = _query(".ContentItem-actions > button:last-child");
        if (collapse)
        {
            collapse.click();
        }
    }
}

/**
 * toggle comment expand/collapse.
 */
function _toggleComment()
{
    const ct = _query(".ContentItem-actions > button:nth-child(2)");
    if (ct)
    {
        ct.click();
    }
}

/**
 * toggle story unlike.
 */
function _unlike()
{
    const element = _query("button:first-child");
    if (element && element.innerText !== "广告")
    {
        element.click();
    }
}

/**
 * open current story in a new tab.
 */
function _openInNewTab()
{
    // 1. answer;
    // 2. empty answer;
    // 3. advertisement.
    const element = _query(".ContentItem-title a, .QuestionItem-title > a, .Advert--card > a");
    if (element)
    {
        element.click();
    }
}

/**
 * find the specified element in current story.
 *
 * @param {string} selector
 * @returns {Element}
 */
function _query(selector)
{
    if (selector)
    {
        const story = stories[currentIndex];
        if (story)
        {
            return story.querySelector(selector);
        }
    }
    return null;
}

/**
 * get ancestor of the element with specified class name.
 *
 * @param {Element} element
 * @param {string} className
 * @returns {Element}
 */
function _getAncestor(element, className)
{
    if (element && className)
    {
        let ancestor = element;
        while (ancestor)
        {
            if (ancestor.className.trim().split(/\W+/).indexOf(className) !== -1)
            {
                return ancestor;
            }
            else
            {
                ancestor = ancestor.parentNode;
            }
        }
    }
    return null;
}

/**
 * get the index of story.
 *
 * @param {Element} story
 * @returns {number}
 */
function _getIndexOfStory(story)
{
    if (story && stories)
    {
        return Array.prototype.indexOf.call(stories, story);
    }
    return -1;
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
