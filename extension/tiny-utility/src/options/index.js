/* global TinyStorage */

document.addEventListener("DOMContentLoaded", init);

let dictElement;
let shortcutElement;
const STORAGE_DICT_SEARCH_ENGINE = "dictSearchEngine";
const STORAGE_DICT_SEARCH_SHORTCUT = "dictSearchShortcut";

function init()
{
    dictElement = document.querySelector(".dictSelect");
    dictElement.addEventListener("change", handleDictChange);

    shortcutElement = document.querySelector(".dictShortcut");
    shortcutElement.addEventListener("change", handleShortcutChange);

    restoreOptions();
}

async function restoreOptions()
{
    const searchEngine = await TinyStorage.get(STORAGE_DICT_SEARCH_ENGINE);
    if (searchEngine)
    {
        for (const option of dictElement.options)
        {
            if (option.value === searchEngine)
            {
                option.selected = true;
            }
        }
    }

    const searchShortcut = await TinyStorage.get(STORAGE_DICT_SEARCH_SHORTCUT) || "f3";
    shortcutElement.value = searchShortcut.toUpperCase();
}

async function handleDictChange(e)
{
    await TinyStorage.set(STORAGE_DICT_SEARCH_ENGINE, e.target.value);
}

async function handleShortcutChange(e)
{
    await TinyStorage.set(STORAGE_DICT_SEARCH_SHORTCUT, (e.target.value || "").toLowerCase());
}
