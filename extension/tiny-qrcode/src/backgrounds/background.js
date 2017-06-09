/* global qr */

const cache = {};

/**
 * Generate QR Code image.
 */
function generateQRImage(p_message, p_sender, p_done)
{
    let dataURL = cache[p_message.text];
    if (!dataURL)
    {
        dataURL = qr.toDataURL(
            {
                mime: "image/png",
                value: p_message.text,
                size: p_message.size
            }
        );
        cache[p_message.text] = dataURL;
    }

    p_done({ dataURL: dataURL });
}

/**
 * Handle tab's onRemoved event. Remove cache of closed tab.
 */
function onRemovedHandler(p_tabId, p_info)
{
    if (!p_info.isWindowClosing)
    {
        browser.tabs.get(p_tabId, (p_tab) =>
        {
            if (p_tab)
            {
                cache[p_tab.url] = null;
            }
        });
    }
}

browser.tabs.onRemoved.addListener(onRemovedHandler);
browser.runtime.onMessage.addListener(generateQRImage);
