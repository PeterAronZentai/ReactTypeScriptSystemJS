System.register("application/components/TermDisplay.js", ["react"], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var React,
      react_1;
  var TermListHeader,
      TermList,
      MappingTypes,
      MappingType,
      mappings,
      MappingDisplay,
      TermDisplay;
  return {
    setters: [function(React_1) {
      React = React_1;
      react_1 = React_1;
    }],
    execute: function() {
      TermListHeader = function(_a) {
        var country = _a.country;
        return React.createElement("div", {className: "term-list"}, React.createElement("div", {className: "term-list-header"}, React.createElement("span", {className: "size-20"}, country, " term"), React.createElement("span", {className: "size-30"}, "Mapping to common"), React.createElement("span", {className: "size-15"}, "Result")), React.createElement("div", {className: "term-list-subheader"}, React.createElement("span", {className: "size-20"}, "Name"), React.createElement("span", {className: "size-10"}, "MapTo"), React.createElement("span", {className: "size-10"}, "RouteTo"), React.createElement("span", {className: "size-10"}, "CollectFrom")));
      };
      exports_1("TermList", TermList = function(_a) {
        var terms = _a.terms,
            _b = _a.showHeader,
            showHeader = _b === void 0 ? true : _b;
        return React.createElement("div", null, showHeader && React.createElement(TermListHeader, {country: "US"}), terms.map(function(term) {
          return React.createElement(TermDisplay, {
            key: term.id,
            term: term
          });
        }));
      });
      (function(MappingTypes) {
        MappingTypes[MappingTypes["mapTo"] = 0] = "mapTo";
        MappingTypes[MappingTypes["routeTo"] = 1] = "routeTo";
        MappingTypes[MappingTypes["collectFrom"] = 2] = "collectFrom";
      })(MappingTypes || (MappingTypes = {}));
      MappingType = (function() {
        function MappingType() {}
        return MappingType;
      }());
      mappings = (_a = {}, _a[MappingTypes.mapTo] = {
        name: MappingTypes[MappingTypes.mapTo],
        icon: "exchange"
      }, _a[MappingTypes.routeTo] = {
        name: MappingTypes[MappingTypes.routeTo],
        icon: "random"
      }, _a[MappingTypes.collectFrom] = {
        name: MappingTypes[MappingTypes.collectFrom],
        icon: "long-arrow-left"
      }, _a);
      exports_1("MappingDisplay", MappingDisplay = function(_a) {
        var term = _a.term,
            mappingType = _a.mappingType,
            _b = _a.mapping,
            mapping = _b === void 0 ? [] : _b,
            taxonomy = _a.taxonomy;
        return !!mapping.length && React.createElement("div", {className: "mapping-group"}, React.createElement("span", {className: "mapping-terms"}, mapping.map(function(map) {
          return React.createElement("span", {
            key: map,
            className: "mapped-term-name"
          }, React.createElement("i", {
            className: "fa fa-" + mappings[mappingType].icon,
            "aria-hidden": "true"
          }), taxonomy.getTerm(map).description);
        })));
      });
      TermDisplay = (function(_super) {
        __extends(TermDisplay, _super);
        function TermDisplay(props, context) {
          _super.call(this, props, context);
          this.state = {isOpen: false};
        }
        TermDisplay.prototype.handleClick = function() {
          this.setState({isOpen: true});
        };
        TermDisplay.prototype.render = function() {
          var _this = this;
          var setIsOpen = function(v) {
            return function() {
              return _this.setState({isOpen: v});
            };
          };
          var OpenLevel = function() {
            return React.createElement("span", {
              class: "size-1",
              onClick: setIsOpen(true)
            }, "(+)");
          };
          var CloseLevel = function() {
            return React.createElement("span", {
              class: "size-1",
              onClick: setIsOpen(false)
            }, "(-)");
          };
          var taxonomy = this.context.taxonomyStore.data;
          var term = this.props.term;
          this.context.taxonomyStore.loadUsageCount(term);
          return React.createElement("div", null, React.createElement("div", {className: "term-item"}, React.createElement("span", {className: "size-20"}, React.createElement("span", {className: "size-1"}, !this.state.isOpen && term.hasChildren && React.createElement(OpenLevel, null), this.state.isOpen && React.createElement(CloseLevel, null)), React.createElement("span", {
            className: "term-name",
            style: {'paddingLeft': 10 * (term.asHierarchy.length - 1)}
          }, term.description), React.createElement("span", {className: "term-count"}, term.usageCount && term.usageCount.toLocaleString())), React.createElement("span", {className: "size-30"}, React.createElement(MappingDisplay, {
            mappingType: MappingTypes.mapTo,
            term: term,
            mapping: term.mapTo,
            taxonomy: taxonomy
          }), React.createElement(MappingDisplay, {
            mappingType: MappingTypes.routeTo,
            term: term,
            mapping: term.routeTo,
            taxonomy: taxonomy
          }), React.createElement(MappingDisplay, {
            mappingType: MappingTypes.collectFrom,
            term: term,
            mapping: term.collectFrom,
            taxonomy: taxonomy
          }))), this.state.isOpen && React.createElement(TermList, {
            terms: term.children,
            showHeader: false
          }));
        };
        TermDisplay.contextTypes = {taxonomyStore: React.PropTypes.object.isRequired};
        return TermDisplay;
      }(react_1.Component));
      exports_1("TermDisplay", TermDisplay);
    }
  };
  var _a;
});

System.register("application/entities/Term.js", [], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var Term,
      createTerm;
  return {
    setters: [],
    execute: function() {
      Term = (function() {
        function Term() {
          this.usageCountLoaded = false;
        }
        Term.prototype.getMapped = function(region) {
          if (region)
            return this.taxonomy.getMap(region, this);
          return this.taxonomy.getTermsForAllRegions(this);
        };
        Object.defineProperty(Term.prototype, "hasMapping", {
          get: function() {
            return !!((this.mapTo && this.mapTo.length) || (this.routeTo && this.routeTo.length));
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "isCommon", {
          get: function() {
            return !this.country || this.country === "Common";
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "hasParent", {
          get: function() {
            return !!this.parentId;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "parent", {
          get: function() {
            if (!this.hasParent)
              return;
            return this.taxonomy.getTerm(this.country, this.parentId);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "children", {
          get: function() {
            return this.taxonomy.getChildren(this);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "hasChildren", {
          get: function() {
            return !!(this.taxonomy.getChildren(this) || []).length;
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "path", {
          get: function() {
            return [this.hasParent ? this.parent.path : this.country, this.description].join("/");
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "asHierarchy", {
          get: function() {
            if (!this.hasParent)
              return [this];
            return this.parent.asHierarchy.concat([this]);
          },
          enumerable: true,
          configurable: true
        });
        Object.defineProperty(Term.prototype, "fullyQualifiedName", {
          get: function() {
            var h = this.asHierarchy;
            return [this.country, h.length - 1].concat(h.map(function(i) {
              return i.description;
            }), [undefined]).join("|");
          },
          enumerable: true,
          configurable: true
        });
        Term.prototype.toString = function() {
          return "TERM:" + this.id;
        };
        Object.defineProperty(Term.prototype, "level", {
          get: function() {
            return this.asHierarchy.length;
          },
          enumerable: true,
          configurable: true
        });
        Term.createTerm = function(taxonomy, init, t) {
          if (!init)
            return;
          if (init instanceof t)
            return init;
          var result = Object.setPrototypeOf(init, t.prototype);
          Object.defineProperty(init, "taxonomy", {
            enumerable: false,
            value: taxonomy
          });
          return result;
        };
        return Term;
      }());
      exports_1("Term", Term);
      exports_1("createTerm", createTerm = function(taxonomy, init) {
        if (!init)
          return;
        if (init instanceof Term)
          return init;
        var result = Object.setPrototypeOf(init, Term.prototype);
        Object.defineProperty(init, "taxonomy", {
          enumerable: false,
          value: taxonomy
        });
        return result;
      });
    }
  };
});

System.register("application/entities/Taxonomy.js", ["./Term"], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var Term_1;
  var indexById,
      asArray,
      Taxonomy;
  function cloneShallow(arr) {
    return arr.map(function(item) {
      var clone = {};
      Object.keys(item).forEach(function(k) {
        clone[k] = item[k];
      });
      return clone;
    });
  }
  function nonEmptyArray(a) {
    return Array.isArray(a) ? a.length : !!a;
  }
  return {
    setters: [function(Term_1_1) {
      Term_1 = Term_1_1;
      exports_1({
        "Term": Term_1_1["Term"],
        "createTerm": Term_1_1["createTerm"]
      });
    }],
    execute: function() {
      exports_1("indexById", indexById = function(p, c) {
        return (p[c.id] = c) && p;
      });
      exports_1("asArray", asArray = function(obj) {
        return Object.keys(obj).map(function(key) {
          return obj[key];
        });
      });
      Taxonomy = (function() {
        function Taxonomy(name, data) {
          if (data === void 0) {
            data = null;
          }
          this.name = name;
          this.data = data;
          this.config = {regions: ['Common', 'GB', 'US', 'AU']};
          this.regions = {};
          this.idIndex = {};
          this.fqnIndex = {};
          this.fuzzyIndex = {};
          this.buildUp(data);
        }
        Taxonomy.prototype.buildUp = function(data) {
          if (data === void 0) {
            data = null;
          }
          this.ensureData(data);
          this.buildUpRegions();
          this.applyMappings();
        };
        Taxonomy.prototype.ensureData = function(data) {
          if (data === void 0) {
            data = null;
          }
          if (data) {
            this.data = data;
            return;
          }
        };
        Taxonomy.prototype.buildUpRegions = function() {
          this.config.regions.forEach(this.buildUpRegion.bind(this));
        };
        Taxonomy.prototype.buildUpRegion = function(region) {
          var _this = this;
          var terms = this.data.filter(function(item) {
            return item.country === region;
          });
          var termsIndex = terms.reduce(function(p, c) {
            return (p[c.id] = c) && p;
          }, {});
          var descriptionIndex = terms.reduce(function(p, c) {
            return (p[c.description] = c) && p;
          }, {});
          var legacyIndex = {};
          terms.forEach(function(term) {
            var oldIds = [].concat(term.legacyId || term.oldIds || []);
            oldIds.forEach(function(oldId) {
              legacyIndex[oldId] = term;
            });
          });
          var parentIndex = {};
          terms.forEach(function(term) {
            _this.idIndex[term.id] = term;
            var key = term.parentId ? term.parentId : "$root";
            var children = (parentIndex[key] = parentIndex[key] || []);
            children.push(term);
          });
          var fuzzyIndex = {};
          this.regions[region] = {
            terms: terms,
            termsIndex: termsIndex,
            parentIndex: parentIndex,
            descriptionIndex: descriptionIndex,
            legacyIndex: legacyIndex,
            fuzzyIndex: fuzzyIndex
          };
          terms.forEach(function(term) {
            _this.fqnIndex[Term_1.createTerm(_this, term).fullyQualifiedName] = term;
          });
          terms.forEach(function(term) {
            _this.fuzzyIndex[term.id] = _this.fuzzyIndex[term.fullyQualifiedName.toLowerCase()] = term;
            fuzzyIndex[term.id] = fuzzyIndex[term.fullyQualifiedName.toLowerCase()] = term;
            if (term.asHierarchy.length < 3) {
              var key = (term.description || "").toLowerCase();
              _this.fuzzyIndex[key] = term;
              fuzzyIndex[key] = term;
            }
          });
        };
        Taxonomy.prototype.getFromLegacyId = function(region, id) {
          return this.regions[region].legacyIndex[id];
        };
        Taxonomy.prototype.getFromFqn = function(fqn) {
          return Term_1.createTerm(this, this.fqnIndex[fqn]);
        };
        Taxonomy.prototype.getFuzzyByRegion = function(region, someid) {
          var term = this.regions[region].fuzzyIndex[someid.toLowerCase()];
          return Term_1.createTerm(this, term);
        };
        Taxonomy.prototype.getFuzzy = function(someId) {
          var key = (someId + "").toLowerCase();
          return Term_1.createTerm(this, this.fuzzyIndex[key]);
        };
        Taxonomy.prototype.getFromDescription = function(region, description) {
          var term;
          if (this.regions[region]) {
            term = this.regions[region].descriptionIndex[description];
          }
          if (term) {
            return Term_1.createTerm(this, term);
          }
        };
        Taxonomy.prototype.applyMappings = function() {
          this.config.regions.filter(function(i) {
            return i !== "Common";
          }).forEach(this.applyRegionalToCommon.bind(this));
        };
        Taxonomy.prototype.applyRegionalToCommon = function(region) {
          var _this = this;
          this.regions[region].terms.forEach(function(term) {
            if (term.mapTo) {
              var ids = [].concat(term.mapTo);
              ids.forEach(_this.mapTermOnCommon.bind(_this, term));
            } else {}
            if (term.collectFrom) {
              var ids = [].concat(term.collectFrom);
              ids.forEach(_this.collectTermFromCommon.bind(_this, term));
            }
          });
        };
        Taxonomy.prototype.mapTermOnCommon = function(term, ctermId) {
          var cterm = this.getCTerm(ctermId);
          if (!cterm) {
            return;
          }
          var region = term.country;
          cterm.mapsFrom = cterm.mapsFrom || {};
          var termIds = cterm.mapsFrom[region] = (cterm.mapsFrom[region] || []);
          if (termIds.indexOf(term.id) < 0) {
            termIds.push(term.id);
          }
        };
        Taxonomy.prototype.collectTermFromCommon = function(term, ctermId) {
          var cterm = this.getCTerm(ctermId);
          if (!cterm) {
            throw new TypeError("missing cterm " + ctermId);
          }
          var region = term.country;
          cterm.collectsTo = cterm.collectsTo || {};
          var termIds = cterm.collectsTo[region] = (cterm.collectsTo[region] || []);
          if (termIds.indexOf(term.id) < 0) {
            termIds.push(term.id);
          }
        };
        Taxonomy.prototype.getRootTerms = function(region) {
          var _this = this;
          return (this.regions[region].parentIndex.$root || []).map(function(term) {
            return Term_1.createTerm(_this, term);
          });
        };
        Taxonomy.prototype.getParent = function(term) {
          return this.getTerm(term.country, term.parentId);
        };
        Taxonomy.prototype.getChildren = function(term) {
          var _this = this;
          return [].concat(this.regions[term.country].parentIndex[term.id] || []).map(function(term) {
            return Term_1.createTerm(_this, term);
          });
        };
        Taxonomy.prototype.getAllTerms = function(region) {
          var _this = this;
          return this.regions[region].terms.map(function(term) {
            return Term_1.createTerm(_this, term);
          });
        };
        Taxonomy.prototype.getTerm = function(region, termId) {
          if (arguments.length === 1) {
            if ("object" === typeof region) {
              return this.getTerm(region.country, region.id);
            }
            return Term_1.createTerm(this, this.idIndex[region]);
          }
          return Term_1.createTerm(this, this.regions[region].termsIndex[termId]);
        };
        Taxonomy.prototype.getCTerm = function(termId) {
          return this.getTerm("Common", termId);
        };
        Taxonomy.prototype.getRegionalTerms = function(region, cterm) {
          var ct = cterm;
          while (ct) {
            if (ct.mapsFrom && ct.mapsFrom[region]) {
              var res = [].concat(ct.mapsFrom[region]).map(this.getTerm.bind(this, region));
              return res;
            }
            if (ct.collectsTo && ct.collectsTo[region]) {
              var res = [].concat(ct.collectsTo[region]).map(this.getTerm.bind(this, region));
              return res;
            }
            ct = this.getParent(ct);
          }
          return [];
        };
        Taxonomy.prototype.getCommonTerms = function(term) {
          if (!term)
            return [];
          if (term.country === "Common") {
            return [term];
          }
          if (nonEmptyArray(term.mapTo)) {
            return [].concat(term.mapTo).map(this.getCTerm.bind(this));
          }
          if (nonEmptyArray(term.routeTo)) {
            return [].concat(term.routeTo).map(this.getCTerm.bind(this));
          }
          return this.getCommonTerms(this.getParent(term));
        };
        Taxonomy.prototype.getMap = function(region, term) {
          var _this = this;
          if (region === term.country) {
            return [].concat(term);
          }
          var cterms = this.getCommonTerms(term);
          if (region === "Common")
            return cterms;
          var rterms = cterms.map(function(term) {
            return _this.getRegionalTerms(region, term);
          }).reduce(function(p, c) {
            return p.concat(c);
          }, []).map(function(term) {
            return Term_1.createTerm(_this, term);
          }).reduce(indexById, {});
          return asArray(rterms);
        };
        Taxonomy.prototype.getTermsForAllRegions = function(term) {
          var _this = this;
          var result = {};
          this.config.regions.forEach(function(r) {
            return result[r] = _this.getMap(r, term);
          });
          return result;
        };
        Taxonomy.prototype.resolveAllTerms = function(terms) {
          var _this = this;
          var regionHashes = [];
          [].concat(terms).forEach(function(term) {
            regionHashes.push(_this.getTermsForAllRegions(term));
          });
          var combined = {};
          regionHashes.forEach(function(hash) {
            Object.keys(hash).forEach(function(key) {
              combined[key] = combined[key] || [];
              combined[key] = combined[key].concat(hash[key]);
            });
          });
          Object.keys(combined).forEach(function(key) {
            combined[key] = asArray(combined[key].reduce(indexById, {}));
          });
          return combined;
        };
        Taxonomy.prototype.getChain = function(term) {
          var t = term,
              terms = [t];
          while (t = this.getTerm(t.country, t.parentId)) {
            terms = terms.concat(t);
          }
          return terms;
        };
        Taxonomy.prototype.walkDown = function(term, cb) {
          this.getChain(term).reverse().forEach(cb);
        };
        Taxonomy.prototype.walkUp = function(term, cb) {
          this.getChain(term).forEach(cb);
        };
        Taxonomy.prototype.resolveTermIdForRegion = function(termId, outputRegion) {
          var term = this.getTerm(termId, undefined);
          if (!term)
            throw new Error("Invalid term id: " + termId + " in taxonomy: " + this.name);
          return term.getMapped(outputRegion);
        };
        Taxonomy.prototype.getTerms = function(resource, region) {
          var _this = this;
          return [].concat(resource[this.name]).filter(function(item) {
            return region ? item.country === region : true;
          }).map(function(item) {
            return _this.getTerm(item, undefined);
          });
        };
        return Taxonomy;
      }());
      exports_1("Taxonomy", Taxonomy);
    }
  };
});

System.register("application/Store.js", ["events", "./entities/Taxonomy"], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : new P(function(resolve) {
          resolve(result.value);
        }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments)).next());
    });
  };
  var events_1,
      Taxonomy_1;
  var Store,
      TermStore,
      termStores,
      getTermStore,
      TaxonomyStore,
      taxonomyStores,
      getTaxonomyStore;
  return {
    setters: [function(events_1_1) {
      events_1 = events_1_1;
    }, function(Taxonomy_1_1) {
      Taxonomy_1 = Taxonomy_1_1;
    }],
    execute: function() {
      Store = (function() {
        function Store() {
          this.loaded = false;
          this.emitter = new events_1.EventEmitter();
        }
        Object.defineProperty(Store.prototype, "data", {
          get: function() {
            return this._data;
          },
          set: function(v) {
            this._data = v;
            console.log("store changed", this, v);
            this.emitter.emit("changed");
          },
          enumerable: true,
          configurable: true
        });
        Store.prototype.loadInternal = function() {
          return __awaiter(this, void 0, Promise, function*() {
            throw new Error("pure func called. implementation missing");
          });
        };
        Store.prototype.load = function(force) {
          return __awaiter(this, void 0, void 0, function*() {
            if (force === void 0) {
              force = false;
            }
            if (this.loaded && !force)
              return;
            this.loaded = true;
            this.data = yield this.loadInternal();
          });
        };
        Store.prototype.on = function(event, cb) {
          console.log("subscribing listener", this, cb.toString());
          this.emitter.on(event, cb);
          return cb;
        };
        Store.prototype.unscubscribe = function(event, cb) {
          this.emitter.removeListener(event, cb);
        };
        Store.prototype.setDefault = function() {
          throw new Error("pure func called. implementation missing");
        };
        return Store;
      }());
      exports_1("Store", Store);
      TermStore = (function(_super) {
        __extends(TermStore, _super);
        function TermStore(name) {
          _super.call(this);
          this.name = name;
        }
        TermStore.prototype.setDefault = function() {
          this.data = [];
        };
        TermStore.prototype.loadInternal = function() {
          return __awaiter(this, void 0, void 0, function*() {
            var response = yield fetch(this.fileName);
            var data = yield response.json();
            return data;
          });
        };
        Object.defineProperty(TermStore.prototype, "fileName", {
          get: function() {
            return "/data/resource-" + this.name + ".json";
          },
          enumerable: true,
          configurable: true
        });
        return TermStore;
      }(Store));
      exports_1("TermStore", TermStore);
      exports_1("termStores", termStores = {});
      exports_1("getTermStore", getTermStore = function(name) {
        return termStores[name] || (termStores[name] = new TermStore(name));
      });
      TaxonomyStore = (function(_super) {
        __extends(TaxonomyStore, _super);
        function TaxonomyStore(name, upstream) {
          var _this = this;
          _super.call(this);
          this.name = name;
          this.upstream = upstream;
          this.usageCountLoaded = false;
          this.termCountIdNameMap = {
            'subjects': ['subject', 'subjects'],
            'ages': ['year', 'years']
          };
          if (!upstream) {
            this.upstream = getTermStore(name);
          }
          this.data = new Taxonomy_1.Taxonomy('', []);
          this.upstream.on("changed", function() {
            _this.data = new Taxonomy_1.Taxonomy(_this.name, _this.upstream.data);
          });
        }
        Object.defineProperty(TaxonomyStore.prototype, "taxonomy", {
          get: function() {
            return this.data;
          },
          enumerable: true,
          configurable: true
        });
        TaxonomyStore.prototype.loadInternal = function() {
          return __awaiter(this, void 0, Promise, function*() {
            this.upstream.load();
            return Promise.resolve(this.data);
          });
        };
        TaxonomyStore.prototype.mapTermName = function(s) {
          console.log("namemap", s, this.termCountIdNameMap);
          return this.termCountIdNameMap[s];
        };
        TaxonomyStore.prototype.loadUsageCount = function(term) {
          return __awaiter(this, void 0, void 0, function*() {
            if (!term.usageCountLoaded) {
              term.usageCountLoaded = true;
              var searchHost = 'http://service-resource-search.service.live.tescloud.com/api/search/v4/term-counts';
              var query = this.mapTermName(this.taxonomy.name)[0] + "-ids=" + encodeURIComponent(term.id.toString()) + "&displayCountry=" + term.country;
              var response = yield fetch(searchHost + "?" + query);
              var data = yield response.json();
              term.usageCount = (data.response[this.mapTermName(this.taxonomy.name)[1]][0] || {}).count;
              this.emitter.emit("changed");
            }
          });
        };
        return TaxonomyStore;
      }(Store));
      exports_1("TaxonomyStore", TaxonomyStore);
      exports_1("taxonomyStores", taxonomyStores = {});
      exports_1("getTaxonomyStore", getTaxonomyStore = function(name) {
        return taxonomyStores[name] || (taxonomyStores[name] = new TaxonomyStore(name));
      });
    }
  };
});

System.register("application/Application.js", ["react", "react-dom", "./components/TermDisplay", "./Store", "react-router"], function(exports_1, context_1) {
  "use strict";
  var __moduleName = context_1 && context_1.id;
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s,
        i = 1,
        n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : new P(function(resolve) {
          resolve(result.value);
        }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments)).next());
    });
  };
  var React,
      react_1,
      react_dom_1,
      TermDisplay_1,
      Store_1,
      react_router_1;
  var NavLink,
      NavMenu,
      Home,
      TaxonomyDisplay,
      TaxonomyRegion,
      Application;
  return {
    setters: [function(React_1) {
      React = React_1;
      react_1 = React_1;
    }, function(react_dom_1_1) {
      react_dom_1 = react_dom_1_1;
    }, function(TermDisplay_1_1) {
      TermDisplay_1 = TermDisplay_1_1;
    }, function(Store_1_1) {
      Store_1 = Store_1_1;
    }, function(react_router_1_1) {
      react_router_1 = react_router_1_1;
    }],
    execute: function() {
      NavLink = (function(_super) {
        __extends(NavLink, _super);
        function NavLink() {
          _super.apply(this, arguments);
        }
        NavLink.prototype.render = function() {
          return React.createElement(react_router_1.Link, __assign({}, this.props, {activeClassName: "active"}));
        };
        return NavLink;
      }(react_1.Component));
      exports_1("NavLink", NavLink);
      NavMenu = function(_a) {
        return React.createElement("ul", null, React.createElement("li", null, React.createElement(NavLink, {to: "/GB"}, "GB Taxonomy"), " "), React.createElement("li", null, React.createElement(NavLink, {to: "/US"}, "US Taxonomy")));
      };
      Home = (function(_super) {
        __extends(Home, _super);
        function Home() {
          _super.apply(this, arguments);
        }
        Home.prototype.render = function() {
          return React.createElement("div", null, React.createElement("div", null, "Home"), React.createElement("div", null, this.props.children));
        };
        return Home;
      }(react_1.Component));
      exports_1("Home", Home);
      TaxonomyDisplay = (function(_super) {
        __extends(TaxonomyDisplay, _super);
        function TaxonomyDisplay() {
          var _this = this;
          _super.apply(this, arguments);
          this.handleStoreUpdate = function() {
            _this.forceUpdate();
          };
        }
        TaxonomyDisplay.prototype.componentDidMount = function() {
          var _this = this;
          console.log("@@@TD mount", this.props.params.country);
          Store_1.getTaxonomyStore(this.props.params.taxonomy).on("changed", function() {
            return _this.handleStoreUpdate();
          });
          Store_1.getTaxonomyStore(this.props.params.taxonomy).load();
        };
        TaxonomyDisplay.prototype.getChildContext = function() {
          var childContext = {taxonomyStore: Store_1.getTaxonomyStore(this.props.params.taxonomy)};
          return childContext;
        };
        TaxonomyDisplay.prototype.render = function() {
          return React.createElement("div", null, React.createElement("div", null, "TD"), React.createElement("div", null, this.props.children));
        };
        TaxonomyDisplay.childContextTypes = {taxonomyStore: React.PropTypes.object.isRequired};
        return TaxonomyDisplay;
      }(react_1.Component));
      exports_1("TaxonomyDisplay", TaxonomyDisplay);
      TaxonomyRegion = (function(_super) {
        __extends(TaxonomyRegion, _super);
        function TaxonomyRegion() {
          _super.apply(this, arguments);
        }
        TaxonomyRegion.prototype.render = function() {
          var taxonomy = this.context.taxonomyStore.data;
          var terms = taxonomy.getRootTerms(this.props.params.country);
          return React.createElement("div", null, React.createElement("div", null, "TR"), React.createElement("div", null, React.createElement(TermDisplay_1.TermList, {
            terms: terms,
            showHeader: true
          })));
        };
        TaxonomyRegion.contextTypes = {taxonomyStore: React.PropTypes.object.isRequired};
        return TaxonomyRegion;
      }(react_1.Component));
      exports_1("TaxonomyRegion", TaxonomyRegion);
      Application = (function(_super) {
        __extends(Application, _super);
        function Application(props, context) {
          _super.call(this, props, context);
          console.log("@@@", context, this.context, this.state);
        }
        Application.prototype.click = function() {
          console.log(this);
        };
        Application.prototype.componentDidMount = function() {
          return __awaiter(this, void 0, void 0, function*() {});
        };
        Application.prototype.render = function() {
          return React.createElement("div", null, React.createElement(NavMenu, null), this.props.children);
        };
        Application.contextTypes = {router: React.PropTypes.object.isRequired};
        return Application;
      }(react_1.Component));
      exports_1("Application", Application);
      react_dom_1.render((React.createElement(react_router_1.Router, {history: react_router_1.hashHistory}, React.createElement(react_router_1.Route, {path: "/"}, React.createElement(react_router_1.IndexRoute, {component: Home}), React.createElement(react_router_1.Route, {
        path: "/:taxonomy",
        component: TaxonomyDisplay
      }, React.createElement(react_router_1.Route, {
        path: "/:taxonomy/:country",
        component: TaxonomyRegion
      }))))), document.getElementById('container'));
    }
  };
});
