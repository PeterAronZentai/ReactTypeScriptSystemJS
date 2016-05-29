"bundle";
(function() {
var define = System.amdDefine;
define("application/TermDisplay.js", ["require", "exports", "react", "react", "./Store"], function(require, exports, React, react_1, Store_1) {
  "use strict";
  const TermListHeader = ({country}) => {
    const otherCountries = ['GB', 'US', 'AU'].filter((c) => c !== country);
    return React.createElement("div", {className: "term-list"}, React.createElement("div", {className: "term-list-header"}, React.createElement("span", {className: "size-20"}, "Source term (", country, ")"), country !== 'Common' && React.createElement("span", {className: "mapping-column mapping-column-header size-20"}, "Terget term (Common)"), React.createElement("span", {className: "mapping-result size-10"}, "Results")), React.createElement("div", {className: "term-list-subheader"}, React.createElement("span", {className: "size-20"}), country !== 'Common' && React.createElement("span", {className: "mapping-column mapping-column-header size-20"}), otherCountries.map((oc) => React.createElement("span", {
      key: oc,
      className: "mapping-result size-10"
    }, oc))));
  };
  exports.TermList = ({terms,
    showHeader = true,
    country = 'GB'}) => React.createElement("div", null, showHeader && React.createElement(TermListHeader, {country: country}), terms.map((term) => React.createElement(TermDisplay, {
    key: term.id,
    term: term
  })));
  var MappingTypes;
  (function(MappingTypes) {
    MappingTypes[MappingTypes["mapTo"] = 0] = "mapTo";
    MappingTypes[MappingTypes["routeTo"] = 1] = "routeTo";
    MappingTypes[MappingTypes["collectFrom"] = 2] = "collectFrom";
  })(MappingTypes || (MappingTypes = {}));
  class MappingType {}
  const mappings = {
    [MappingTypes.mapTo]: {
      name: MappingTypes[MappingTypes.mapTo],
      icon: "exchange"
    },
    [MappingTypes.routeTo]: {
      name: MappingTypes[MappingTypes.routeTo],
      icon: "random"
    },
    [MappingTypes.collectFrom]: {
      name: MappingTypes[MappingTypes.collectFrom],
      icon: "long-arrow-left"
    }
  };
  exports.MappingDisplay = ({term,
    mappingType}) => {
    const mapping = term[MappingTypes[mappingType]] || [];
    return (React.createElement("div", {className: "mapping-group"}, React.createElement("span", {className: "mapping-terms"}, mapping.map((map) => React.createElement("span", {
      key: map,
      className: "mapped-term-name"
    }, React.createElement("i", {
      className: `fa fa-${mappings[mappingType].icon}`,
      "aria-hidden": "true"
    }), term.taxonomy.getTerm(map).pathName)))));
  };
  exports.MappingResult = ({term,
    country,
    mappingResult}) => React.createElement("span", {className: "size-10 mapping-result"}, mappingResult.map((result) => React.createElement("span", {
    key: result.id,
    className: "mapped-term-name"
  }, result.pathName)));
  class TermDisplay extends react_1.Component {
    constructor(props, context) {
      super(props, context);
      this.state = {isOpen: false};
    }
    handleClick() {
      this.setState({isOpen: true});
    }
    render() {
      var term = this.props.term;
      const taxonomyStore = Store_1.getTaxonomyStore(term.taxonomy.name);
      const showOpener = () => !this.state.isOpen && term.hasChildren;
      const showHider = () => this.state.isOpen;
      const setIsOpen = (v) => () => {
        this.setState({isOpen: v});
      };
      const taxonomy = taxonomyStore.data;
      const OpenLevel = () => React.createElement("span", {
        class: "size-1",
        onClick: setIsOpen(true)
      }, "(+)");
      const CloseLevel = () => React.createElement("span", {
        class: "size-1",
        onClick: setIsOpen(false)
      }, "(-)");
      if (term.country !== "Common")
        taxonomyStore.loadUsageCount(term);
      const regions = taxonomy.config.regions.filter((region) => region !== term.country && region != 'Common');
      const mappedTerms = term.getMapped();
      return React.createElement("div", null, React.createElement("div", {className: "term-item"}, React.createElement("span", {className: "size-20"}, React.createElement("span", {className: "size-1"}, showOpener() && React.createElement(OpenLevel, null), showHider() && React.createElement(CloseLevel, null)), React.createElement("span", {
        className: "mappable-term term-name",
        style: {'paddingLeft': 10 * (term.asHierarchy.length - 1)}
      }, term.description), React.createElement("span", {className: "term-count"}, term.usageCount && term.usageCount.toLocaleString())), term.country !== 'Common' && React.createElement("span", {className: "mapping-column size-20"}, React.createElement(exports.MappingDisplay, {
        mappingType: MappingTypes.mapTo,
        term: term
      }), React.createElement(exports.MappingDisplay, {
        mappingType: MappingTypes.routeTo,
        term: term
      }), React.createElement(exports.MappingDisplay, {
        mappingType: MappingTypes.collectFrom,
        term: term
      })), regions.map((regionName) => React.createElement(exports.MappingResult, {
        key: regionName,
        term: term,
        country: regionName,
        mappingResult: mappedTerms[regionName]
      }))), this.state.isOpen && React.createElement(exports.TermList, {
        terms: term.children,
        showHeader: false
      }));
    }
  }
  exports.TermDisplay = TermDisplay;
});

})();
(function() {
var define = System.amdDefine;
define("application/Taxonomy.js", ["require", "exports"], function(require, exports) {
  "use strict";
  exports.indexById = (p, c) => (p[c.id] = c) && p;
  exports.asArray = (obj) => Object.keys(obj).map((key) => obj[key]);
  function cloneShallow(arr) {
    return arr.map((item) => {
      let clone = {};
      Object.keys(item).forEach((k) => {
        clone[k] = item[k];
      });
      return clone;
    });
  }
  function nonEmptyArray(a) {
    return Array.isArray(a) ? a.length : !!a;
  }
  class Taxonomy {
    constructor(name, data = null) {
      this.name = name;
      this.data = data;
      this.config = {regions: ['Common', 'GB', 'US', 'AU']};
      this.regions = {};
      this.idIndex = {};
      this.fqnIndex = {};
      this.fuzzyIndex = {};
      this.buildUp(data);
    }
    buildUp(data = null) {
      this.ensureData(data);
      this.buildUpRegions();
      this.applyMappings();
    }
    ensureData(data = null) {
      if (data) {
        this.data = data;
        return;
      }
    }
    buildUpRegions() {
      this.config.regions.forEach(this.buildUpRegion.bind(this));
    }
    buildUpRegion(region) {
      var terms = this.data.filter((item) => item.country === region);
      var termsIndex = terms.reduce((p, c) => (p[c.id] = c) && p, {});
      var descriptionIndex = terms.reduce((p, c) => (p[c.description] = c) && p, {});
      var legacyIndex = {};
      terms.forEach((term) => {
        var oldIds = [].concat(term.legacyId || term.oldIds || []);
        oldIds.forEach((oldId) => {
          legacyIndex[oldId] = term;
        });
      });
      var parentIndex = {};
      terms.forEach((term) => {
        this.idIndex[term.id] = term;
        let key = term.parentId ? term.parentId : "$root";
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
      terms.forEach((term) => {
        this.fqnIndex[exports.createTerm(this, term).fullyQualifiedName] = term;
      });
      terms.forEach((term) => {
        this.fuzzyIndex[term.id] = this.fuzzyIndex[term.fullyQualifiedName.toLowerCase()] = term;
        fuzzyIndex[term.id] = fuzzyIndex[term.fullyQualifiedName.toLowerCase()] = term;
        if (term.asHierarchy.length < 3) {
          var key = (term.description || "").toLowerCase();
          this.fuzzyIndex[key] = term;
          fuzzyIndex[key] = term;
        }
      });
    }
    getFromLegacyId(region, id) {
      return this.regions[region].legacyIndex[id];
    }
    getFromFqn(fqn) {
      return exports.createTerm(this, this.fqnIndex[fqn]);
    }
    getFuzzyByRegion(region, someid) {
      var term = this.regions[region].fuzzyIndex[someid.toLowerCase()];
      return exports.createTerm(this, term);
    }
    getFuzzy(someId) {
      var key = (someId + "").toLowerCase();
      return exports.createTerm(this, this.fuzzyIndex[key]);
    }
    getFromDescription(region, description) {
      let term;
      if (this.regions[region]) {
        term = this.regions[region].descriptionIndex[description];
      }
      if (term) {
        return exports.createTerm(this, term);
      }
    }
    applyMappings() {
      this.config.regions.filter((i) => i !== "Common").forEach(this.applyRegionalToCommon.bind(this));
    }
    applyRegionalToCommon(region) {
      this.regions[region].terms.forEach((term) => {
        if (term.mapTo) {
          let ids = [].concat(term.mapTo);
          ids.forEach(this.mapTermOnCommon.bind(this, term));
        } else {}
        if (term.collectFrom) {
          let ids = [].concat(term.collectFrom);
          ids.forEach(this.collectTermFromCommon.bind(this, term));
        }
      });
    }
    mapTermOnCommon(term, ctermId) {
      var cterm = this.getCTerm(ctermId);
      if (!cterm) {
        return;
      }
      var region = term.country;
      cterm.mapsFrom = cterm.mapsFrom || {};
      let termIds = cterm.mapsFrom[region] = (cterm.mapsFrom[region] || []);
      if (termIds.indexOf(term.id) < 0) {
        termIds.push(term.id);
      }
    }
    collectTermFromCommon(term, ctermId) {
      var cterm = this.getCTerm(ctermId);
      if (!cterm) {
        throw new TypeError("missing cterm " + ctermId);
      }
      var region = term.country;
      cterm.collectsTo = cterm.collectsTo || {};
      let termIds = cterm.collectsTo[region] = (cterm.collectsTo[region] || []);
      if (termIds.indexOf(term.id) < 0) {
        termIds.push(term.id);
      }
    }
    getRootTerms(region) {
      return (this.regions[region].parentIndex.$root || []).map((term) => exports.createTerm(this, term));
    }
    getParent(term) {
      return this.getTerm(term.country, term.parentId);
    }
    getChildren(term) {
      return [].concat(this.regions[term.country].parentIndex[term.id] || []).map((term) => exports.createTerm(this, term));
    }
    getAllTerms(region) {
      return this.regions[region].terms.map((term) => exports.createTerm(this, term));
    }
    getTerm(region, termId) {
      if (arguments.length === 1) {
        if ("object" === typeof region) {
          return this.getTerm(region.country, region.id);
        }
        return exports.createTerm(this, this.idIndex[region]);
      }
      return exports.createTerm(this, this.regions[region].termsIndex[termId]);
    }
    getCTerm(termId) {
      return this.getTerm("Common", termId);
    }
    getRegionalTerms(region, cterm) {
      var ct = cterm;
      while (ct) {
        if (ct.mapsFrom && ct.mapsFrom[region]) {
          let res = [].concat(ct.mapsFrom[region]).map(this.getTerm.bind(this, region));
          return res;
        }
        if (ct.collectsTo && ct.collectsTo[region]) {
          let res = [].concat(ct.collectsTo[region]).map(this.getTerm.bind(this, region));
          return res;
        }
        ct = this.getParent(ct);
      }
      return [];
    }
    getCommonTerms(term) {
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
    }
    getMap(region, term) {
      if (region === term.country) {
        return [].concat(term);
      }
      const cterms = this.getCommonTerms(term);
      if (region === "Common")
        return cterms;
      const rterms = cterms.map((term) => this.getRegionalTerms(region, term)).reduce((p, c) => p.concat(c), []).map((term) => exports.createTerm(this, term)).reduce(exports.indexById, {});
      return exports.asArray(rterms);
    }
    getTermsForAllRegions(term) {
      var result = {};
      this.config.regions.forEach((r) => result[r] = this.getMap(r, term));
      return result;
    }
    resolveAllTerms(terms) {
      var regionHashes = [];
      [].concat(terms).forEach((term) => {
        regionHashes.push(this.getTermsForAllRegions(term));
      });
      var combined = {};
      regionHashes.forEach((hash) => {
        Object.keys(hash).forEach((key) => {
          combined[key] = combined[key] || [];
          combined[key] = combined[key].concat(hash[key]);
        });
      });
      Object.keys(combined).forEach((key) => {
        combined[key] = exports.asArray(combined[key].reduce(exports.indexById, {}));
      });
      return combined;
    }
    getChain(term) {
      var t = term,
          terms = [t];
      while (t = this.getTerm(t.country, t.parentId)) {
        terms = terms.concat(t);
      }
      return terms;
    }
    walkDown(term, cb) {
      this.getChain(term).reverse().forEach(cb);
    }
    walkUp(term, cb) {
      this.getChain(term).forEach(cb);
    }
    resolveTermIdForRegion(termId, outputRegion) {
      const term = this.getTerm(termId, undefined);
      if (!term)
        throw new Error("Invalid term id: " + termId + " in taxonomy: " + this.name);
      return term.getMapped(outputRegion);
    }
    getTerms(resource, region) {
      return [].concat(resource[this.name]).filter((item) => region ? item.country === region : true).map((item) => this.getTerm(item, undefined));
    }
  }
  exports.Taxonomy = Taxonomy;
  class Term {
    constructor() {
      this.usageCountLoaded = false;
      this.isOpen = false;
    }
    getMapped(region) {
      if (region)
        return this.taxonomy.getMap(region, this);
      return this.taxonomy.getTermsForAllRegions(this);
    }
    get hasMapping() {
      return !!((this.mapTo && this.mapTo.length) || (this.routeTo && this.routeTo.length));
    }
    get isCommon() {
      return !this.country || this.country === "Common";
    }
    get hasParent() {
      return !!this.parentId;
    }
    get parent() {
      if (!this.hasParent)
        return;
      return this.taxonomy.getTerm(this.country, this.parentId);
    }
    get children() {
      return this.taxonomy.getChildren(this);
    }
    get hasChildren() {
      return !!(this.taxonomy.getChildren(this) || []).length;
    }
    get pathName() {
      return this.asHierarchy.map((t) => t.description).join(" / ");
    }
    get asHierarchy() {
      if (!this.hasParent)
        return [this];
      return [...this.parent.asHierarchy, this];
    }
    get fullyQualifiedName() {
      const h = this.asHierarchy;
      return [this.country, h.length - 1, ...h.map((i) => i.description), undefined].join("|");
    }
    toString() {
      return "TERM:" + this.id;
    }
    get level() {
      return this.asHierarchy.length;
    }
    static createTerm(taxonomy, init, t) {
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
    }
  }
  exports.Term = Term;
  exports.createTerm = (taxonomy, init) => {
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
  };
});

})();
(function() {
var define = System.amdDefine;
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
define("application/Store.js", ["require", "exports", "events", "./Taxonomy"], function(require, exports, events_1, Taxonomy_1) {
  "use strict";
  class Store {
    constructor() {
      this.loaded = false;
      this.emitter = new events_1.EventEmitter();
    }
    get data() {
      return this._data;
    }
    set data(v) {
      this._data = v;
      this.emitter.emit("changed");
    }
    loadInternal() {
      return __awaiter(this, void 0, Promise, function*() {
        throw new Error("pure func called. implementation missing");
      });
    }
    load(force = false) {
      return __awaiter(this, void 0, void 0, function*() {
        if (this.loaded && !force)
          return;
        this.loaded = true;
        this.data = yield this.loadInternal();
      });
    }
    fireChange() {
      this.emitter.emit("changed");
    }
    on(event, cb) {
      this.emitter.on(event, cb);
      return cb;
    }
    unscubscribe(event, cb) {
      this.emitter.removeListener(event, cb);
    }
    setDefault() {
      throw new Error("pure func called. implementation missing");
    }
  }
  exports.Store = Store;
  class TermStore extends Store {
    constructor(name) {
      super();
      this.name = name;
    }
    setDefault() {
      this.data = [];
    }
    loadInternal() {
      return __awaiter(this, void 0, void 0, function*() {
        var response = yield fetch(this.fileName);
        var data = yield response.json();
        return data;
      });
    }
    get fileName() {
      return `/data/resource-${this.name}.json`;
    }
  }
  exports.TermStore = TermStore;
  exports.termStores = {};
  exports.getTermStore = (name) => exports.termStores[name] || (exports.termStores[name] = new TermStore(name));
  class TaxonomyStore extends Store {
    constructor(name, upstream) {
      super();
      this.name = name;
      this.upstream = upstream;
      this.usageCountLoaded = false;
      this.termCountIdNameMap = {
        'subjects': ['subject', 'subjects'],
        'ages': ['year', 'years']
      };
      if (!upstream) {
        this.upstream = exports.getTermStore(name);
      }
      this.data = new Taxonomy_1.Taxonomy('', []);
      this.upstream.on("changed", () => {
        this.data = new Taxonomy_1.Taxonomy(this.name, this.upstream.data);
      });
    }
    get taxonomy() {
      return this.data;
    }
    loadInternal() {
      return __awaiter(this, void 0, Promise, function*() {
        this.upstream.load();
        return Promise.resolve(this.data);
      });
    }
    mapTermName(s) {
      return this.termCountIdNameMap[s];
    }
    loadUsageCount(term) {
      return __awaiter(this, void 0, void 0, function*() {
        if (!term.usageCountLoaded) {
          term.usageCountLoaded = true;
          var searchHost = 'http://service-resource-search.service.live.tescloud.com/api/search/v4/term-counts';
          var query = `${this.mapTermName(this.taxonomy.name)[0]}-ids=${encodeURIComponent(term.id.toString())}&displayCountry=${term.country}`;
          var response = yield fetch(`${searchHost}?${query}`);
          var data = yield response.json();
          term.usageCount = (data.response[this.mapTermName(this.taxonomy.name)[1]][0] || {}).count;
          this.emitter.emit("changed");
        }
      });
    }
  }
  exports.TaxonomyStore = TaxonomyStore;
  exports.taxonomyStores = {};
  exports.getTaxonomyStore = (name) => exports.taxonomyStores[name] || (exports.taxonomyStores[name] = new TaxonomyStore(name));
});

})();
(function() {
var define = System.amdDefine;
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
define("application/Application.js", ["require", "exports", "react", "react", "react-dom", "./TermDisplay", "./Store", "react-router"], function(require, exports, React, react_1, react_dom_1, TermDisplay_1, Store_1, react_router_1) {
  "use strict";
  class NavLink extends react_1.Component {
    render() {
      return React.createElement(react_router_1.Link, __assign({}, this.props, {activeClassName: "active"}));
    }
  }
  exports.NavLink = NavLink;
  const NavMenu = ({}) => React.createElement("ul", {className: "menu taxonomy-menu"}, React.createElement("li", {className: "menu-head"}, "category >>"), React.createElement("li", null, React.createElement(NavLink, {to: "/subjects"}, "Subject"), " "), React.createElement("li", null, React.createElement(NavLink, {to: "/ages"}, "Age")), React.createElement("li", null, React.createElement(NavLink, {to: "/attachment-types"}, "Attachment")));
  const CountryMenu = ({parent}) => React.createElement("ul", {className: "menu country-menu"}, React.createElement("li", {className: "menu-head"}, "region >>"), React.createElement("li", null, React.createElement(NavLink, {to: `${parent}/GB`}, "United Kingdom"), " "), React.createElement("li", null, React.createElement(NavLink, {to: `${parent}/US`}, "United States")), React.createElement("li", null, React.createElement(NavLink, {to: `${parent}/AU`}, "Australia")), React.createElement("li", null, React.createElement(NavLink, {to: `${parent}/Common`}, "Common")));
  const TaxonomyViewTemplate = ({terms,
    country,
    taxonomy}) => React.createElement("div", null, React.createElement("div", {className: "menu-bar"}, React.createElement(NavMenu, null), React.createElement(CountryMenu, {parent: taxonomy.name})), React.createElement("div", {className: "workspace"}, React.createElement(TermDisplay_1.TermList, {
    terms: terms,
    showHeader: true,
    country: country
  })));
  class Home extends react_1.Component {
    render() {
      return React.createElement("div", null, React.createElement("div", null, "Home"), React.createElement("div", null, this.props.children));
    }
  }
  exports.Home = Home;
  class TaxonomyView extends react_1.Component {
    constructor(...args) {
      super(...args);
      this.handleStoreUpdate = () => {
        setTimeout(() => this.forceUpdate(), 0);
      };
      this.subscriptions = {};
    }
    componentWillReceiveProps(nextProps, nextContext) {
      if (nextProps.routeParams.taxonomy !== this.props.routeParams.taxonomy) {
        this.subscribeToStore(nextProps.routeParams.taxonomy);
      }
    }
    subscribeToStore(taxonomyName) {
      const taxonomyStore = Store_1.getTaxonomyStore(taxonomyName);
      this.subscriptions[taxonomyName] = this.subscriptions[taxonomyName] || taxonomyStore.on("changed", () => this.handleStoreUpdate());
      taxonomyStore.load();
    }
    componentDidMount() {
      this.subscribeToStore(this.props.params.taxonomy);
    }
    get taxonomyStore() {
      return Store_1.getTaxonomyStore(this.props.params.taxonomy);
    }
    render() {
      const country = this.props.params.country;
      const taxonomy = this.taxonomyStore.data;
      const terms = country && taxonomy && taxonomy.getRootTerms(country) || [];
      const viewProps = {
        country: country,
        taxonomy: taxonomy,
        terms: terms
      };
      return React.createElement(TaxonomyViewTemplate, __assign({}, viewProps));
    }
  }
  exports.TaxonomyView = TaxonomyView;
  class Application extends react_1.Component {
    render() {
      return React.createElement("div", null, this.props.children);
    }
  }
  exports.Application = Application;
  react_dom_1.render((React.createElement(react_router_1.Router, {history: react_router_1.hashHistory}, React.createElement(react_router_1.Redirect, {
    from: "/",
    to: "/subjects/GB"
  }), React.createElement(react_router_1.Route, {
    path: "/",
    component: Application
  }, React.createElement(react_router_1.IndexRoute, {component: Home}), React.createElement(react_router_1.Redirect, {
    from: "/:taxonomy",
    to: "/:taxonomy/GB"
  }), React.createElement(react_router_1.Route, {path: "/:taxonomy"}, React.createElement(react_router_1.Route, {
    path: "/:taxonomy/:country",
    component: TaxonomyView
  }))))), document.getElementById('container'));
});

})();