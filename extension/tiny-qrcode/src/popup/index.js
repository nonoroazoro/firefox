const qrImage = document.getElementById("qrImage");

// Open QR image in a new tab.
qrImage.addEventListener("click", (e) =>
{
    window.open(e.target.src);
    window.close();
});

browser.tabs.onActivated.addListener(onActivatedHandler);
browser.tabs.onUpdated.addListener(onUpdatedHandler);

/**
 * Handle tab's onActivated event.
 */
function onActivatedHandler(e)
{
    if (e)
    {
        browser.tabs.get(e.tabId, (tab) =>
        {
            if (tab)
            {
                updateQRCodeImage(tab.url);
            }
        });
    }
    else
    {
        browser.tabs.query(
            {
                active: true,
                currentWindow: true
            },
            (tabs) =>
            {
                if (tabs && tabs.length > 0)
                {
                    updateQRCodeImage(tabs[0].url);
                }
            }
        );
    }
}

/**
 * Handle tab's onUpdated event.
 */
function onUpdatedHandler(tabId, tabInfo, tab)
{
    if (tabInfo.status === "complete")
    {
        updateQRCodeImage(tab.url);
    }
}

/**
 * Update QR Code image to the <img> in the popup.
 */
function updateQRCodeImage(text)
{
    browser.runtime.sendMessage(
        {
            size: 10,
            text
        },
        (res) =>
        {
            qrImage.src = res.dataURL;
        }
    );
}

// Init.
onActivatedHandler();
