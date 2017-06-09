const qrImage = document.getElementById("qr-image");

// Open qrcode image in new tab.
qrImage.addEventListener("click", (e) =>
{
    window.open(e.target.src);
    window.close();
});

/**
 * Handle tab's onActivated event.
 */
function onActivatedHandler(e)
{
    if (e)
    {
        browser.tabs.get(e.tabId, (p_tab) =>
        {
            if (p_tab)
            {
                updateQRCodeImage(p_tab.url);
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
            (p_tabs) =>
            {
                if (p_tabs && p_tabs.length > 0)
                {
                    updateQRCodeImage(p_tabs[0].url);
                }
            }
        );
    }
}

/**
 * Handle tab's onUpdated event.
 */
function onUpdatedHandler(p_tabId, p_info, p_tab)
{
    if (p_info.status === "complete")
    {
        updateQRCodeImage(p_tab.url);
    }
}

/**
 * Update QR Code image to <img> of popup.
 */
function updateQRCodeImage(p_text)
{
    browser.runtime.sendMessage(
        {
            size: 10,
            text: p_text
        },
        (p_res) =>
        {
            qrImage.src = p_res.dataURL;
        }
    );
}

browser.tabs.onActivated.addListener(onActivatedHandler);
browser.tabs.onUpdated.addListener(onUpdatedHandler);

// Init.
onActivatedHandler();
