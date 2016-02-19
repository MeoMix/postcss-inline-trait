# PostCSS Inline Trait [![Build Status][ci-img]][ci]

[PostCSS] plugin which allows for inline declaration of CSS properties whose values will be imported from a traits directory..

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/MeoMix/postcss-inline-trait.svg
[ci]:      https://travis-ci.org/MeoMix/postcss-inline-trait

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-inline-trait') ])
```

See [PostCSS] docs for examples for your environment.
