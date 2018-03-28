const TinyStorage = {
    /**
     * Stores an item of tiny-utility settings in local storage.
     *
     * @param {string} key
     * @param {object} value
     */
    async set(key, value)
    {
        return browser.storage.local.set({ [key]: value });
    },

    /**
     * Retrieves an item of tiny-utility settings from local storage.
     * If you pass `null` or `undefined`, the entire tiny-utility settings will be retrieved.
     *
     * @param {string} key
     */
    async get(key)
    {
        const value = await browser.storage.local.get(key);
        if (key)
        {
            return value && value[key];
        }
        else
        {
            return value;
        }
    }
};

window.TinyStorage = TinyStorage;
