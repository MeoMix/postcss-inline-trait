import postcss from 'postcss';
import test from 'ava';
import inlineTrait from '../src';

const run = (t, input, output, opts = {}) => {
  return postcss([inlineTrait(opts)]).process(input)
    .then((result) => {
      t.same(result.css, output);
      t.same(result.warnings().length, 0);
    });
};

test('throws if not provided getFileText method as option', (t) => {
  return postcss(inlineTrait).process('').catch((err) => {
    t.same(err.reason, 'Expected getFileText to be provided as option to constructor');
  });
});

test('runs ok', (t) =>
  run(t, '', '', {
    getFileText() {
      return '';
    },
    traitPath: ''
  })
);