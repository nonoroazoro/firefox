/* global qr */

const cache = new Map();

/**
 * Generate QR Code image.
 */
function generateQRImage(message, sender, done)
{
    let dataURL = cache.get(message.text);
    if (!dataURL)
    {
        dataURL = qr.toDataURL({
            mime: "image/png",
            value: message.text,
            size: message.size
        });
        cache.set(message.text, dataURL);
    }
    done({ dataURL });
}

/**
 * Handle tab's onRemoved event. Remove cache of closed tab.
 */
async function onRemovedHandler(tabId, info)
{
    if (!info.isWindowClosing)
    {
        const tab = await browser.tabs.get(tabId);
        if (tab)
        {
            cache.clear(tab.url);
        }
    }
}

browser.tabs.onRemoved.addListener(onRemovedHandler);
browser.runtime.onMessage.addListener(generateQRImage);
