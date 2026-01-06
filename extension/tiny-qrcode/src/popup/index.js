const qrImage = document.getElementById("qrImage");
const qrText = document.getElementById("qrText");

// Open QR image in a new tab.
qrImage.addEventListener("click", (e) =>
{
    window.open(e.target.src);
    window.close();
});

// Update QR code when user types in the input.
let debounceTimer;
qrText.addEventListener("input", (e) =>
{
    clearTimeout(debounceTimer);
    const text = e.target.value.trim();
    if (text !== "")
    {
        debounceTimer = setTimeout(() =>
        {
            generateQRCodeImage(text);
        }, 500);
    }
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
 * Update text and image.
 */
function updateQRCodeImage(text)
{
    qrText.value = text;
    generateQRCodeImage(text);
}

/**
 * Generate image.
 */
function generateQRCodeImage(text)
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
