/**
 * Keyboard shortcuts.
 */
browser.commands.onCommand.addListener((command) =>
{
    if (command === "generateQR")
    {
        browser.browserAction.openPopup();
    }
});
