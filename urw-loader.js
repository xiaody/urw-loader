/**
 * Unlimited Resource Works
 * A minimalist frontend resource loader that
 * you can actually understand and extend.
 * @version 1.2.0
 * @license MIT
 * @flow weak
 */
;(function (global) {
  'use strict'

  function URW (config) {
    this.config = config = config || {}
    this.util = Object.create(URW.util)
    this._middlewares = []

    var loader = this
    if (config.middlewares) {
      config.middlewares.forEach(function (ware) {
        loader.use(ware)
      })
    }
  }

  URW.prototype = {
    constructor: URW,

    use: function (func) {
      var plugins = URW.plugins
      if (typeof func === 'function') {
        this._middlewares.push(func)
      } else if (typeof func === 'string' && plugins[func]) {
        this._middlewares.push(plugins[func])
      }
      return this
    },

    load: function () {
      var loader = this
      var ret = Promise.resolve()
      var resource, i, len, progress, resolve

      // each argument is a step
      for (i = 0, len = arguments.length; i < len; i++) {
        // var progress represent the state of this step
        // we dont use Promise.defer 'cuz its not standardized
        progress = new Promise(function (res) { // eslint-disable-line promise/param-names
          resolve = res
        })
        resource = loader._preprocess(arguments[i], progress)

        ret = (function (resource) {
          return ret.then(function () {
            return loader._load(resource)
          })
        })(resource)

        // resolve progress after this step is loaded
        ;(function (resolve) {
          ret.then(resolve)
        })(resolve)
      }
      return ret
    },

    _preprocess: function (resource, progress) {
      var middlewares = this._middlewares
      var ret = resource
      var i, len, ware
      for (i = 0, len = middlewares.length; i < len; i++) {
        ware = middlewares[i]
        if (/Group$/.test(ware.name)) {
          ret = this._processGroup(ware, ret, progress)
        } else {
          ret = this._processSingle(ware, ret, progress)
        }
      }
      return ret
    },

    // a normal middleware always receives a single resource,
    // even if the previous middleware return an array
    _processSingle: function (ware, resource, progress) {
      var loader = this
      if (Array.isArray(resource)) {
        return resource.map(function (r) {
          return loader._processSingle(ware, r, progress)
        })
      }
      return ware.call(this, resource, progress)
    },

    // a middleware whose name ends with "Group"
    // will always receive an array,
    // even if the previous middleware return a single resource
    _processGroup: function (ware, resource, progress) {
      if (!Array.isArray(resource)) {
        resource = [resource]
      }
      return ware.call(this, resource, progress)
    },

    _load: function (href) {
      var loader = this
      return new Promise(function (resolve) {
        var util = loader.util
        if (Array.isArray(href)) {
          return resolve(Promise.all(href.map(function (item) {
            return loader._load(item)
          })))
        }
        if (typeof href === 'function') {
          return resolve(href())
        }
        if (util.isThenable(href)) {
          return resolve(href)
        }
        href += ''
        if (!href) {
          return resolve()
        }
        resolve(util.load(href))
      })
    }
  }

  URW.plugins = {}
  URW.util = {
    load: loadJS, // you can overwrite .load method to change the fetch method
    isThenable: isThenable
  }

  global.URW = URW

  function isThenable (obj) {
    return !!obj && typeof obj === 'object' &&
        typeof obj.then === 'function'
  }

  function loadJS (src) {
    return new Promise(function (resolve, reject) {
      var ref = document.getElementsByTagName('script')[0]
      var script = window.document.createElement('script')
      script.src = src
      script.async = true
      script.onload = resolve
      script.onerror = reject
      ref.parentNode.insertBefore(script, ref)
    })
  }
})(this)
