/*jshint browser:true, loopfunc:true*/
;(function () {

'use strict';

function URW (config) {
    this.config = config = config || {};
    this.util = URW.util;
    this._middlewares = [];

    var loader = this;
    if (config.middlewares)
        config.middlewares.forEach(function (ware) {
            loader.use(ware);
        });
}

URW.prototype = {
    constructor: URW,

    use: function (func) {
        var plugins = URW.plugins;
        if (typeof func === 'function')
            this._middlewares.push(func);
        else if (typeof func === 'string' && plugins[func])
            this._middlewares.push(plugins[func]);
        return this;
    },

    load: function () {
        var loader = this,
            resource, i, len, progress, resolve, ret;

        // each argument is a step
        for (i = 0, len = arguments.length; i < len; i++) {
            progress = new Promise(function (res) {
                resolve = res;
            });
            resource = loader._preprocess(arguments[i], progress);

            if (!ret) {
                ret = loader._load(resource);
            } else { // other steps follow
                ret = (function (resource) {
                    return ret.then(function () {
                        return loader._load(resource);
                    });
                })(resource);
            }
            (function (resolve) {
                ret.then(resolve);
            })(resolve);
        }
        return ret;
    },

    _preprocess: function (resource, progress) {
        var middlewares = this._middlewares;
        var ret = resource;
        var i, len, ware;
        for (i = 0, len = middlewares.length; i < len; i++) {
            ware = middlewares[i];
            if (/Group$/.test(ware.name))
                ret = this._processGroup(ware, ret, progress);
            else
                ret = this._processSingle(ware, ret, progress);
        }
        return ret;
    },

    // a normal middleware always receives a single resource,
    // even if the previous middleware return an array
    _processSingle: function (ware, resource, progress) {
        var loader = this;
        if (Array.isArray(resource))
            return resource.map(function (r) {
                return loader._processSingle(ware, r, progress);
            });
        return ware.call(this, resource, progress);
    },

    // a middleware whos name ends with Group
    // will always receive a array,
    // even if the previous middleware return a single resource
    _processGroup: function (ware, resource, progress) {
        if (!Array.isArray(resource))
            resource = [resource];
        return ware.call(this, resource, progress);
    },

    _load: function (href) {
        var loader = this;
        return new Promise(function (resolve) {
            var util = loader.util;
            if (Array.isArray(href))
                return resolve(Promise.all(href.map(function (item) {
                    return loader._load(item);
                })));
            if (typeof href === 'function')
                return resolve(href.call(window));
            if (util.isThenable(href))
                return resolve(href);
            href += '';
            if (!href)
                return resolve();
            resolve(util.load(href));
        });
    }

};

URW.plugins = {};
URW.util = {
    load: loadJS, // you can overwrite .load method to change the fetch method
    isThenable: isThenable
};

window.URW = URW;

function isThenable (obj) {
    return typeof obj === 'object' &&
            typeof obj.then === 'function';
}

function loadJS (src) {
    return new Promise(function (resolve, reject) {
        _loadJS(src, resolve); // TODO error handling?
    });
}

/*! loadJS: load a JS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc.
 * (Based on http://goo.gl/REQGQ by Paul Irish). Licensed MIT */
function _loadJS( src, cb ){
    var ref = window.document.getElementsByTagName( "script" )[ 0 ];
    var script = window.document.createElement( "script" );
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore( script, ref );
    if (cb && typeof(cb) === "function") {
        script.onload = cb;
    }
    return script;
}

})();
