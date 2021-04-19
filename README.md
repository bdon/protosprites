## Overview

[Demo](https://protomaps.github.io/protosprites/examples/display.html)

Protosprites is a sprite-like system for sheets of icons. A sheet is just a single-file HTML document containing SVGs; sheets are loaded and baked into bitmaps on a canvas, where they can be sampled efficiently via Canvas 2D `drawImage`. This is useful for resolution-independent map symbology inside web browsers.

## Format

A protosprites sheet is a collection of SVGs organized in a specific way:
* It must be an HTML document with all SVGs as children of the `body` element
* Each SVG element must hae a width and a height in px, interpreted as CSS (not device) pixels
* Each SVG must have a unique ID attribute

Example of a valid protosprites sheet:

```html
<html>
  <body>
    <svg id="foobar" width="20px" height="20px" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="green"/>
    </svg>
  </body>
</html>
```

SVGs can also be defined inline, avoiding a fetch request, but care should be taken to ensure IDs are unique:

```html
  <div id="icons">
    <svg id="foobar" ...>
  </div>
  ...
  <script>
    let sheet = new Protosprites(document.getElementById('icons').children)
    ...
```

## Library usage

a Protosprites instance asynchronously loads the sheet and renders it to an off-screen Canvas context at device-native resolution. The canvas can then be sampled by icon name via the `get` method:

```js
let sheet = new Protosprites('sheet.html')
let canvas = document.getElementById("canvas")
let ctx = canvas.getContext('2d')
sheet.get('foobar').then(s => {
    ctx.drawImage(s.canvas,s.x,s.y,s.w,s.h,0,0,s.w,s.h)
})
```
