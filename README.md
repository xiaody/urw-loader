A minimalist JavaScript loader that you can actually understand and extend.

701 bytes (gzip)

Notice: urw-loader is expected to be used in an environment which has Promise and common Array methods.

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
var loader = new URW({
    domain: '//s0.cdn.net/'
})
loader.use(function cdnUrl (resource) {
  if (typeof resource !== 'string')
    return resource
  return this.config.domain + resource + '.js'
})
var promise2 = loader.load(
  ['zepto', 'hammer'],
  'paidui/page',
  function initPage () { }
)
/* promise2 has exactly the same timeline with promise1*/
```

# loadable resources
String, function, Promise and Array are loadable.
