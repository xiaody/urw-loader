A minimalist frontend resource loader that you can actually understand and extend.

714 bytes (gzip)

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

## use middlewares

```javascript
var loader = new URW({
  domain: '//s0.cdn.net/'
})

loader.use(function addext (resource) {
  return resource + '.js'
}).use(function comboGroup (resource) {
  return this.config.domain + '?combo=' + resource.join()
}).use(function timing (resource, progress) {
    var start = Date.now()
    progress.then(function () {
        console.info('urw timing:', Date.now() - start, resource)
    })
})

var promise2 = loader.load(
  ['zepto', 'hammer'],
  'paidui/page'
).then(function initPage () {})
```


# loadable resources
String, function, Promise and Array are loadable.

# request method
You can overwrite the util.load method to change the request method,
e.g. load js by xhr or load css.
