console.log("=== tiny-utility contentscripts loaded ===");

/* global Mousetrap, TinyStorage */

const KEYBOARD_SHORTCUTS = {
    "f3": function handler(e)
    {
        // Dictionary
        e.preventDefault();

        let url = "http://dict.youdao.com";
        const select = getSelectedText();
        if (select !== "")
        {
            url = `${url}/search?q=${encodeURI(select)}`;
        }

        browser.runtime.sendMessage({
            payload: url,
            type: "openLink"
        });
    }
};

function bindKeyboardShortcut(combo, callback)
{
    Mousetrap.bind(combo, callback);
}

function getSelectedText()
{
    let text = "";
    const activeEl = document.activeElement;
    const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
    if (
        (
            activeElTagName === "textarea"
            || (
                activeElTagName === "input"
                && /^(?:text|search|password|tel|url)$/i.test(activeEl.type)
            )
        )
        && (typeof activeEl.selectionStart === "number")
    )
    {
        text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
    }
    else if (window.getSelection)
    {
        text = window.getSelection().toString();
    }
    return text;
}

Object.keys(KEYBOARD_SHORTCUTS).forEach((key) =>
{
    bindKeyboardShortcut(key, KEYBOARD_SHORTCUTS[key]);
});
