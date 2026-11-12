[![glide.js](https://glidejs.com/images/glidejs-logotype-dark.png)](https://glidejs.com)

### [Glide.js](https://glidejs.com) is a dependency-free JavaScript ES6 slider and carousel. It’s lightweight, flexible and fast. Designed to slide. No less, no more

[![Build Status](https://api.travis-ci.org/glidejs/glide.svg?branch=master)](https://travis-ci.org/glidejs/glide)

What can convince you:
- **Dependency-free**. Everything included, ready for action.
- Lightweight. Only **~23kb (~7kb gzipped)** with every functionality on board.
- **Modular**. Remove unused modules and drop script weight even more.
- **Extendable**. Plug-in your own modules with additional functionalities.
- **Bundlers ready**. Using Rollup or Webpack? We have your back.

## Documentation

Visit [glidejs.com](https://glidejs.com/docs) for documentation.

> Looking for old documentation? [Wiki](https://github.com/glidejs/glide/wiki) contains archived documentation of Glide.js in version `^2.0.0`.

## Donation

Glide.js is an open source project licensed under the MIT license. It's completely free to use. However, it would be great if you buy me a cup of coffee once in a while to keep me awake :)

- [PayPal](https://www.paypal.me/jedrzejchalubek)
- [Github Sponsors](https://github.com/sponsors/jedrzejchalubek)

## Getting started

Pull-in a latest version with NPM ...

```bash
npm install @glidejs/glide
```

... provide `<link>` to the required core stylesheet. You can also optionally add an included theme stylesheet ...

```html
<!-- Required Core stylesheet -->
<link rel="stylesheet" href="node_modules/@glidejs/glide/dist/css/glide.core.min.css">

<!-- Optional Theme stylesheet -->
<link rel="stylesheet" href="node_modules/@glidejs/glide/dist/css/glide.theme.min.css">
```

... then, prepare a little bit of necessary markup ...

```html
<div class="glide">
  <div data-glide-el="track" class="glide-track">
    <ul class="glide-slides">
      <li class="glide-slide"></li>
      <li class="glide-slide"></li>
      <li class="glide-slide"></li>
    </ul>
  </div>
</div>
```

... and finally, initialize and mount a Glide.

```js
import Glide from '@glidejs/glide'

new Glide('.glide').mount()
```

Need a few selected modules? Import and mount only what you need.

```js
import Glide, { Controls, Breakpoints } from '@glidejs/glide/dist/glide.modular.esm'

new Glide('.glide').mount({ Controls, Breakpoints })
```

## Contributing

The issue channel is especially for improvement proposals and bug reporting. If you have implementing problems, please write on StackOverflow with [glidejs](https://stackoverflow.com/questions/tagged/glidejs) tag.

## Theming

The optional theme stylesheet (`glide.theme.css`) reads its colors from custom properties. Set them on any ancestor of the slider, or on `:root`:

```css
.glide {
  --glide-control-color: #222;               /* arrow text and hover border, active bullet (default: white) */
  --glide-control-muted-color: #2228;        /* arrow border, bullets (default: white at 50%) */
  --glide-control-shadow-color: transparent; /* arrow and bullet shadows (default: black at 10%) */
}
```

The theme places each `.glide-arrow` by its `data-glide-dir`: a direction ending in `<` on the left, one ending in `>` on the right.

### States

Glide marks state with attributes rather than classes, so style them with attribute selectors:

| Attribute | Element | Meaning |
| --- | --- | --- |
| `data-type="slider\|carousel"` | root | The `type` option |
| `data-direction="ltr\|rtl"` | root | The `direction` option |
| `data-swipeable` | root | The Swipe component is mounted |
| `data-dragging` | root | A swipe or drag is in progress |
| `data-active` | slide | The current slide |
| `data-clone` | slide | A copy added by the `carousel` type |
| `aria-current="true"` | bullet | The bullet of the current slide |
| `aria-disabled="true"` | arrow | The arrow cannot move further (`rewind: false`) |

```css
.glide-slide[data-active] { outline: 2px solid; }
.glide-arrow[aria-disabled="true"] { visibility: hidden; }
```

## Browser Support

Glide targets [Baseline Widely Available](https://web.dev/baseline) browsers, the same default as Vite 8:

 - Chrome 111+
 - Edge 111+
 - Firefox 114+
 - Safari 16.4+
 - Safari iOS 16.4+

## Building

Build using NPM scripts. The following scripts are available:
- `build:css` - Outputs prefixed and minified CSS files from the stylesheets in `src/assets/css`.
- `build:js` - Outputs all destination variants of the script, plus TypeScript declarations for the ES module builds.
- `build` - Comprehensively builds the entire library.
- `test` - Runs complete test suite.
- `typecheck` - Type-checks the TypeScript sources and tests.
- `lint` - Lints library TypeScript and CSS files.

## Credits

- [Jędrzej Chałubek](https://github.com/jedrzejchalubek) - Creator
- [Contributors](../../contributors)

## License

Copyright (c) 2014-present, [Jędrzej Chałubek](https://jedrzejchalubek.com). Licensed under the terms of the [MIT License](https://opensource.org/licenses/MIT).
