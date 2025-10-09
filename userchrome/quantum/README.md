# UserChromeJS for Firefox 143

This UserChromeJS is based on [alice0775/userChrome.js](https://github.com/alice0775/userChrome.js) with some customization.

## Workflow

1. `Firefox` loads `config-prefs.js`;

1. `config-prefs.js` loads `config.js`;

1. `config.js` loads all `*.uc.js` scripts;

## Installation

- for `Windows`:
    1. copy files from `installation` folder into `Firefox.exe` folder.

    1. copy `chrome` folder into your `Firefox profiles` folder.

- for `Mac`:
    1. copy files from `installation` folder into `Firefox.app/Contents/Resources` folder.

    1. copy `chrome` folder into your `Firefox profiles` folder.
