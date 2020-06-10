// console.log("=== tiny-utility contentscripts loaded ===");

/* global Mousetrap, TinyStorage */

const STORAGE_DICT_SEARCH_ENGINE = "dictSearchEngine";
const STORAGE_DICT_SEARCH_SHORTCUT = "dictSearchShortcut";

const DICT_SEARCH_ENGINES = {
    "youdao": {
        getSearchUrl(select)
        {
            let url = "http://dict.youdao.com";
            if (select)
            {
                url = `${url}/search?q=${encodeURI(select)}`;
            }
            return url;
        }
    },
    "iciba": {
        getSearchUrl(select)
        {
            let url = "http://www.iciba.com";
            if (select)
            {
                url = `${url}/${encodeURI(select)}`;
            }
            return url;
        }
    },
    "bing": {
        getSearchUrl(select)
        {
            let url = "https://cn.bing.com/dict";
            if (select)
            {
                url = `${url}/search?q=${encodeURI(select)}`;
            }
            return url;
        }
    },
    "cambridge": {
        getSearchUrl(select)
        {
            let url = "https://dictionary.cambridge.org/zhs/%E8%AF%8D%E5%85%B8/%E8%8B%B1%E8%AF%AD-%E6%B1%89%E8%AF%AD-%E7%AE%80%E4%BD%93";
            if (select)
            {
                url = `${url}/${encodeURI(select)}`;
            }
            return url;
        }
    }
};

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

async function bindKeyboardShortcuts()
{
    const searchShortcut = await TinyStorage.get(STORAGE_DICT_SEARCH_SHORTCUT) || "f3";
    const shortcuts = {
        [searchShortcut]: async function handler(e)
        {
            // Dictionary Search.
            e.preventDefault();

            const searchEngine = await TinyStorage.get(STORAGE_DICT_SEARCH_ENGINE);
            const engine = DICT_SEARCH_ENGINES[searchEngine] || DICT_SEARCH_ENGINES["cambridge"];
            const url = engine.getSearchUrl(getSelectedText());
            browser.runtime.sendMessage({
                payload: url,
                type: "openLink"
            });
        }
    };

    Object.keys(shortcuts).forEach((key) =>
    {
        Mousetrap.bind(key, shortcuts[key]);
    });
}

bindKeyboardShortcuts();
