console.log("=== tiny-utility background loaded ===");

browser.runtime.onMessage.addListener(handleMessage);

function handleMessage(message)
{
    switch (message.type)
    {
        case "openLink":
            openLink(message.payload);
            break;

        default:
            break;
    }
}

function openLink(url)
{
    browser.tabs.create({ url });
}
