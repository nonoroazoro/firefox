# UserChromeJS for Firefox Quantum

This UserChromeJS is based on [nuchi/firefox-quantum-userchromejs](https://github.com/nuchi/firefox-quantum-userchromejs) with customization, includes two files:

1. userChrome.css

1. userChrome.xml


## Workflow

1. `Firefox` loads `userChrome.css`;

1. `userChrome.css` loads `userChrome.xml`;

1. `userChrome.xml` loads all `*.uc.js` scripts;

1. Done.
