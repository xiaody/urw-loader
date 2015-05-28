A minimalist JavaScript loader that you can actually understand and extend.

701 bytes (gzip)

# sample code

## a simple loader

```javascript
var loader = new URW
var promise1 = loader.load(
  ['http://s0.cdn.net/zepto.js', 'http://s0.cdn.net/hammer.js'],
  'http://s0.cdn.net/paidui/page.js',
  function initPage () {
    // use zepto, hammer, page.js
  }
)
/* the timeline for above code */
// ====zepto=====
// ====hammer=====
//                  ===page.js====
//                                   initPage()
```

## extend it

```javascript
var loader = new URW
loader.use(function cdnUrl (resource) {
  return 'http://s0.cdn.net/' + resource + '.js'
})
var promise2 = loader.load(
  ['zepto', 'hammer'],
  'paidui/page',
  function initPage () { }
)
/* promise2 has the same timeline with promise1*/
```

# loadable resources
String, function, Promise and Array are loadable.
