# PostCSS Inline Trait [![Build Status][ci-img]][ci]

[PostCSS] plugin which allows for inline declaration of CSS properties whose values will be imported from a traits directory..

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/MeoMix/postcss-inline-trait.svg
[ci]:      https://travis-ci.org/MeoMix/postcss-inline-trait

Converts:
```css
.foo {
    /* .css file-ending is optional */
    /* path is assumed to be ./common/css/traits/fancy.trait */
    trait: superFancy from 'fancy.trait';
}

/* fancy.css */
.superFancy {
    background-color: 'pink';
}
```

into:
```css
.foo {
  background-color: 'pink';
}
```

## Usage

```js
var inlineTrait = require('postcss-inline-trait');
postcss([inlineTrait({
    getFileText: function(path){
        // return environment-specific means of retrieving text at path such as Node's fs.readFile or SystemJS fetch
        // e.g:
        return System.normalize(path).then(System.import.bind(System));
    }
})])
```

See [PostCSS] docs for examples for your environment.
