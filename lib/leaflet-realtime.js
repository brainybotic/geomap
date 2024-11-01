/*! leaflet-realtime - v2.2.0 - 2019-09-07 */

!(function (e) {
  if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = e();
  else if ("function" == typeof define && define.amd) define([], e);
  else {
    var t;
    (
      (t =
        "undefined" != typeof window
          ? window
          : "undefined" != typeof global
          ? global
          : "undefined" != typeof self
          ? self
          : this).L || (t.L = {})
    ).Realtime = e();
  }
})(function () {
  return (function s(o, a, u) {
    function f(t, e) {
      if (!a[t]) {
        if (!o[t]) {
          var r = "function" == typeof require && require;
          if (!e && r) return r(t, !0);
          if (h) return h(t, !0);
          var n = new Error("Cannot find module '" + t + "'");
          throw ((n.code = "MODULE_NOT_FOUND"), n);
        }
        var i = (a[t] = { exports: {} });
        o[t][0].call(
          i.exports,
          function (e) {
            return f(o[t][1][e] || e);
          },
          i,
          i.exports,
          s,
          o,
          a,
          u
        );
      }
      return a[t].exports;
    }
    for (
      var h = "function" == typeof require && require, e = 0;
      e < u.length;
      e++
    )
      f(u[e]);
    return f;
  })(
    {
      1: [
        function (e, t, r) {
          "use strict";
          (L.Realtime = L.Layer.extend({
            options: {
              start: !0,
              interval: 6e4,
              getFeatureId: function (e) {
                return e.properties.id;
              },
              updateFeature: function (e, t) {
                if (t) {
                  var r = e.geometry && e.geometry.type,
                    n = e.geometry && e.geometry.coordinates;
                  switch (r) {
                    case "Point":
                      t.setLatLng(L.GeoJSON.coordsToLatLng(n));
                      break;
                    case "LineString":
                    case "MultiLineString":
                      t.setLatLngs(
                        L.GeoJSON.coordsToLatLngs(n, "LineString" === r ? 0 : 1)
                      );
                      break;
                    case "Polygon":
                    case "MultiPolygon":
                      t.setLatLngs(
                        L.GeoJSON.coordsToLatLngs(n, "Polygon" === r ? 1 : 2)
                      );
                      break;
                    default:
                      return null;
                  }
                  return t;
                }
              },
              logErrors: !0,
              cache: !1,
              removeMissing: !0,
              onlyRunWhenAdded: !1,
            },
            initialize: function (e, t) {
              L.setOptions(this, t),
                (this._container = t.container || L.geoJson(null, t)),
                "function" == typeof e
                  ? (this._src = e)
                  : ((this._fetchOptions = e && e.url ? e : { url: e }),
                    (this._src = L.bind(this._defaultSource, this))),
                (this._features = {}),
                (this._featureLayers = {}),
                (this._requestCount = 0),
                this.options.start &&
                  !this.options.onlyRunWhenAdded &&
                  this.start();
            },
            start: function () {
              return (
                this._timer ||
                  ((this._timer = setInterval(
                    L.bind(this.update, this),
                    this.options.interval
                  )),
                  this.update()),
                this
              );
            },
            stop: function () {
              return (
                this._timer && (clearTimeout(this._timer), delete this._timer),
                this
              );
            },
            isRunning: function () {
              return this._timer;
            },
            setUrl: function (e) {
              if (!this._fetchOptions)
                throw new Error("Custom sources does not support setting URL.");
              (this._fetchOptions.url = e), this.update();
            },
            update: function (e) {
              var t,
                r,
                n = ++this._requestCount,
                i = L.bind(function (e) {
                  return L.bind(function () {
                    if (n === this._requestCount)
                      return e.apply(this, arguments);
                  }, this);
                }, this);
              return (
                e
                  ? this._onNewData(!1, e)
                  : ((t = L.bind(function (e) {
                      this._onNewData(this.options.removeMissing, e);
                    }, this)),
                    (r = L.bind(this._onError, this)),
                    this._src(i(t), i(r))),
                this
              );
            },
            remove: function (e) {
              var t,
                r,
                n,
                i = L.Util.isArray(e) ? e : e.features ? e.features : [e],
                s = {};
              for (t = 0, r = i.length; t < r; t++)
                (n = this.options.getFeatureId(i[t])),
                  this._container.removeLayer(this._featureLayers[n]),
                  (s[n] = this._features[n]),
                  delete this._features[n],
                  delete this._featureLayers[n];
              return (
                this.fire("update", {
                  features: this._features,
                  enter: {},
                  update: {},
                  exit: s,
                }),
                this
              );
            },
            getLayer: function (e) {
              return this._featureLayers[e];
            },
            getFeature: function (e) {
              return this._features[e];
            },
            getBounds: function () {
              var e = this._container;
              if (e.getBounds) return e.getBounds();
              throw new Error("Container has no getBounds method");
            },
            onAdd: function (e) {
              e.addLayer(this._container), this.options.start && this.start();
            },
            onRemove: function (e) {
              this.options.onlyRunWhenAdded && this.stop(),
                e.removeLayer(this._container);
            },
            _onNewData: function (e, t) {
              var u,
                f,
                h,
                c = [],
                d = {},
                l = {},
                r = {},
                _ = {},
                p = L.bind(function (e) {
                  var t = L.Util.isArray(e) ? e : e.features;
                  if (t)
                    for (u = 0, f = t.length; u < f; u++)
                      ((h = t[u]).geometries ||
                        h.geometry ||
                        h.features ||
                        h.coordinates) &&
                        p(h);
                  else {
                    var r = this._container,
                      n = this.options;
                    if (!n.filter || n.filter(e)) {
                      var i = L.GeoJSON.asFeature(e),
                        s = n.getFeatureId(i),
                        o = this._featureLayers[s],
                        a = this.options.updateFeature(i, o);
                      if (!a) {
                        if (!(a = L.GeoJSON.geometryToLayer(e, n))) return;
                        (a.defaultOptions = a.options),
                          (a.feature = i),
                          n.onEachFeature && n.onEachFeature(e, a),
                          n.style && a.setStyle && a.setStyle(n.style(e));
                      }
                      (a.feature = i),
                        r.resetStyle && r.resetStyle(a),
                        o
                          ? ((l[s] = e), o != a && (c.push(o), r.addLayer(a)))
                          : ((d[s] = e), r.addLayer(a)),
                        (this._featureLayers[s] = a),
                        (this._features[s] = _[s] = i);
                    }
                  }
                }, this);
              for (
                p(t), e && (r = this._removeUnknown(_)), u = 0;
                u < c.length;
                u++
              )
                this._container.removeLayer(c[u]);
              this.fire("update", {
                features: this._features,
                enter: d,
                update: l,
                exit: r,
              });
            },
            _onError: function (e, t) {
              this.options.logErrors && console.warn(e, t),
                this.fire("error", { error: e, message: t });
            },
            _removeUnknown: function (e) {
              var t,
                r = {};
              for (t in this._featureLayers)
                e[t] ||
                  (this._container.removeLayer(this._featureLayers[t]),
                  (r[t] = this._features[t]),
                  delete this._featureLayers[t],
                  delete this._features[t]);
              return r;
            },
            _bustCache: function (e) {
              return e + L.Util.getParamString({ _: new Date().getTime() }, e);
            },
            _defaultSource: function (e, t) {
              var r = this._fetchOptions,
                n = r.url;
              (n = this.options.cache ? n : this._bustCache(n)),
                fetch(n, r)
                  .then(function (e) {
                    return e.json();
                  })
                  .then(e)
                  .catch(t);
            },
          })),
            (L.realtime = function (e, t) {
              return new L.Realtime(e, t);
            }),
            (t.exports = L.Realtime);
        },
        {},
      ],
    },
    {},
    [1]
  )(1);
});
