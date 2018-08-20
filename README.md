# articulate-review-cli [![npm package version](https://img.shields.io/npm/v/articulate-review-cli.svg)](https://npm.im/articulate-review-cli) [![github license](https://img.shields.io/github/license/vladimyr/articulate-review-cli.svg)](https://github.com/vladimyr/articulate-review-cli/blob/master/LICENSE) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/Flet/semistandard)

>:arrow_double_down: Download storyline from [Articulate Review](https://360.articulate.com/review/content)

This CLI enables easy download of storyline archives directly from [Articulate Review](https://360.articulate.com/review/content).

## Installation

```
$ npm install -g vladimyr/articulate-review-cli
```

Or for a one-time run:

```
$ npx vladimyr/articulate-review-cli
```

## Usage

```
$ articulate-review-cli <storyId> <archivePath>
```

To get `storyId` from Articulate Review page execute this bookmarklet:

```javascript
javascript:!function(){var e=document.querySelector("iframe.player").src.replace(/\/story(.*?)$/,""),t=e.substring(e.lastIndexOf("/")+1);!function(e){var t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="absolute",t.style.left="-9999px",document.body.appendChild(t);var o=document.getSelection(),n=0<o.rangeCount&&o.getRangeAt(0);t.select(),document.execCommand("copy"),document.body.removeChild(t),n&&((o=document.getSelection()).removeAllRanges(),o.addRange(n))}(t),window.alert("Story id copied to clipboard: "+t)}();
```
