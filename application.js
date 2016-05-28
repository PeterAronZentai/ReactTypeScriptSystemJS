var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
System.register("entities/Taxonomy", ["entities/Term"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Term_1;
    var indexById, asArray, Taxonomy;
    function cloneShallow(arr) {
        return arr.map(item => {
            let clone = {};
            Object.keys(item).forEach(k => { clone[k] = item[k]; });
            return clone;
        });
    }
    function nonEmptyArray(a) {
        return Array.isArray(a) ? a.length : !!a;
    }
    return {
        setters:[
            function (Term_1_1) {
                Term_1 = Term_1_1;
                exports_1({
                    "Term": Term_1_1["Term"],
                    "createTerm": Term_1_1["createTerm"]
                });
            }],
        execute: function() {
            exports_1("indexById", indexById = (p, c) => (p[c.id] = c) && p);
            exports_1("asArray", asArray = (obj) => Object.keys(obj).map(key => obj[key]));
            class Taxonomy {
                constructor(name, data = null) {
                    this.name = name;
                    this.data = data;
                    this.config = { regions: ['Common', 'GB', 'US', 'AU'] };
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
                    var terms = this.data.filter(item => item.country === region);
                    var termsIndex = terms.reduce((p, c) => (p[c.id] = c) && p, {});
                    var descriptionIndex = terms.reduce((p, c) => (p[c.description] = c) && p, {});
                    var legacyIndex = {};
                    terms.forEach(term => {
                        var oldIds = [].concat(term.legacyId || term.oldIds || []);
                        oldIds.forEach(oldId => {
                            legacyIndex[oldId] = term;
                        });
                    });
                    var parentIndex = {};
                    terms.forEach(term => {
                        this.idIndex[term.id] = term;
                        let key = term.parentId ? term.parentId : "$root";
                        var children = (parentIndex[key] = parentIndex[key] || []);
                        children.push(term);
                    });
                    var fuzzyIndex = {};
                    this.regions[region] = { terms: terms, termsIndex: termsIndex, parentIndex: parentIndex, descriptionIndex: descriptionIndex, legacyIndex: legacyIndex, fuzzyIndex: fuzzyIndex };
                    terms.forEach(term => {
                        this.fqnIndex[Term_1.createTerm(this, term).fullyQualifiedName] = term;
                    });
                    terms.forEach(term => {
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
                    return Term_1.createTerm(this, this.fqnIndex[fqn]);
                }
                getFuzzyByRegion(region, someid) {
                    var term = this.regions[region].fuzzyIndex[someid.toLowerCase()];
                    return Term_1.createTerm(this, term);
                }
                getFuzzy(someId) {
                    var key = (someId + "").toLowerCase();
                    return Term_1.createTerm(this, this.fuzzyIndex[key]);
                }
                getFromDescription(region, description) {
                    let term;
                    if (this.regions[region]) {
                        term = this.regions[region].descriptionIndex[description];
                    }
                    if (term) {
                        return Term_1.createTerm(this, term);
                    }
                }
                applyMappings() {
                    this.config
                        .regions
                        .filter(i => i !== "Common")
                        .forEach(this.applyRegionalToCommon.bind(this));
                }
                applyRegionalToCommon(region) {
                    this.regions[region].terms.forEach(term => {
                        if (term.mapTo) {
                            let ids = [].concat(term.mapTo);
                            ids.forEach(this.mapTermOnCommon.bind(this, term));
                        }
                        else {
                        }
                        if (term.collectFrom) {
                            let ids = [].concat(term.collectFrom);
                            ids.forEach(this.collectTermFromCommon.bind(this, term));
                        }
                    });
                }
                mapTermOnCommon(term, ctermId) {
                    var cterm = this.getCTerm(ctermId);
                    if (!cterm) {
                        //todo uncomment when mapping is done
                        //logger.warn(`Missing common term  ${ctermId} when mapping ${term.description} ${term.country}`)
                        //throw new TypeError("missing cterm " + ctermId)
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
                    return (this.regions[region]
                        .parentIndex
                        .$root || [])
                        .map(term => Term_1.createTerm(this, term));
                }
                getParent(term) {
                    return this.getTerm(term.country, term.parentId);
                }
                getChildren(term) {
                    return [].concat(this.regions[term.country].parentIndex[term.id] || [])
                        .map(term => Term_1.createTerm(this, term));
                }
                getAllTerms(region) {
                    return this.regions[region].terms
                        .map(term => Term_1.createTerm(this, term));
                }
                getTerm(region, termId) {
                    if (arguments.length === 1) {
                        if ("object" === typeof region) {
                            return this.getTerm(region.country, region.id);
                        }
                        return Term_1.createTerm(this, this.idIndex[region]);
                    }
                    return Term_1.createTerm(this, this.regions[region].termsIndex[termId]);
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
                    //uncomment when mapping is done
                    // logger.warn(`Can't resolve ${cterm.description}:${cterm.id} to ${region}`)
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
                    const rterms = cterms
                        .map(term => this.getRegionalTerms(region, term))
                        .reduce((p, c) => p.concat(c), [])
                        .map(term => Term_1.createTerm(this, term))
                        .reduce(indexById, {});
                    return asArray(rterms);
                }
                getTermsForAllRegions(term) {
                    var result = {};
                    this.config.regions.forEach(r => result[r] = this.getMap(r, term));
                    return result;
                }
                resolveAllTerms(terms) {
                    var regionHashes = [];
                    [].concat(terms).forEach(term => {
                        regionHashes.push(this.getTermsForAllRegions(term));
                    });
                    var combined = {};
                    regionHashes.forEach(hash => {
                        Object.keys(hash).forEach(key => {
                            combined[key] = combined[key] || [];
                            combined[key] = combined[key].concat(hash[key]);
                        });
                    });
                    Object.keys(combined).forEach(key => {
                        combined[key] = asArray(combined[key].reduce(indexById, {}));
                    });
                    return combined;
                }
                getChain(term) {
                    var t = term, terms = [t];
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
                /** term specific */
                resolveTermIdForRegion(termId, outputRegion) {
                    const term = this.getTerm(termId, undefined);
                    if (!term)
                        throw new Error("Invalid term id: " + termId + " in taxonomy: " + this.name);
                    return term.getMapped(outputRegion);
                }
                /** v4 resource specific */
                getTerms(resource, region) {
                    return [].concat(resource[this.name])
                        .filter(item => region ? item.country === region : true)
                        .map(item => this.getTerm(item, undefined));
                }
            }
            exports_1("Taxonomy", Taxonomy);
        }
    }
});
System.register("entities/Term", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Term, createTerm;
    return {
        setters:[],
        execute: function() {
            class Term {
                constructor() {
                    this.usageCountLoaded = false;
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
                get path() {
                    return [this.hasParent ? this.parent.path : this.country, this.description].join("/");
                }
                get asHierarchy() {
                    if (!this.hasParent)
                        return [this];
                    return [...this.parent.asHierarchy, this];
                }
                get fullyQualifiedName() {
                    const h = this.asHierarchy;
                    return [this.country, h.length - 1, ...h.map(i => i.description), undefined].join("|");
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
            exports_2("Term", Term);
            exports_2("createTerm", createTerm = (taxonomy, init) => {
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
    }
});
System.register("Store", ['events', "entities/Taxonomy"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var events_1, Taxonomy_1;
    var Store, TermStore, termStores, getTermStore, TaxonomyStore, taxonomyStores, getTaxonomyStore;
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (Taxonomy_1_1) {
                Taxonomy_1 = Taxonomy_1_1;
            }],
        execute: function() {
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
                    console.log("store changed", this, v);
                    this.emitter.emit("changed");
                }
                loadInternal() {
                    return __awaiter(this, void 0, Promise, function* () {
                        throw new Error("pure func called. implementation missing");
                    });
                }
                load(force = false) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (this.loaded && !force)
                            return;
                        this.loaded = true;
                        this.data = yield this.loadInternal();
                    });
                }
                on(event, cb) {
                    console.log("subscribing listener", this, cb.toString());
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
            exports_3("Store", Store);
            class TermStore extends Store {
                constructor(name) {
                    super();
                    this.name = name;
                }
                setDefault() {
                    this.data = [];
                }
                loadInternal() {
                    return __awaiter(this, void 0, void 0, function* () {
                        var response = yield fetch(this.fileName);
                        var data = yield response.json();
                        return data;
                    });
                }
                get fileName() { return `/data/resource-${this.name}.json`; }
            }
            exports_3("TermStore", TermStore);
            exports_3("termStores", termStores = {});
            exports_3("getTermStore", getTermStore = name => termStores[name] || (termStores[name] = new TermStore(name)));
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
                        this.upstream = getTermStore(name);
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
                    return __awaiter(this, void 0, Promise, function* () {
                        this.upstream.load();
                        return Promise.resolve(this.data);
                    });
                }
                mapTermName(s) {
                    console.log("namemap", s, this.termCountIdNameMap);
                    return this.termCountIdNameMap[s];
                }
                loadUsageCount(term) {
                    return __awaiter(this, void 0, void 0, function* () {
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
            exports_3("TaxonomyStore", TaxonomyStore);
            exports_3("taxonomyStores", taxonomyStores = {});
            exports_3("getTaxonomyStore", getTaxonomyStore = name => taxonomyStores[name] || (taxonomyStores[name] = new TaxonomyStore(name)));
        }
    }
});
System.register("components/TermDisplay", ['react'], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var React, react_1;
    var TermListHeader, TermList, MappingTypes, MappingType, mappings, MappingDisplay, TermDisplay;
    return {
        setters:[
            function (React_1) {
                React = React_1;
                react_1 = React_1;
            }],
        execute: function() {
            TermListHeader = ({ country }) => React.createElement("div", {className: "term-list"}, React.createElement("div", {className: "term-list-header"}, React.createElement("span", {className: "size-20"}, country, " term"), React.createElement("span", {className: "size-30"}, "Mapping to common"), React.createElement("span", {className: "size-15"}, "Result")), React.createElement("div", {className: "term-list-subheader"}, React.createElement("span", {className: "size-20"}, "Name"), React.createElement("span", {className: "size-10"}, "MapTo"), React.createElement("span", {className: "size-10"}, "RouteTo"), React.createElement("span", {className: "size-10"}, "CollectFrom")));
            exports_4("TermList", TermList = ({ terms, showHeader = true }) => React.createElement("div", null, showHeader && React.createElement(TermListHeader, {country: "US"}), terms.map(term => React.createElement(TermDisplay, {key: term.id, term: term}))));
            (function (MappingTypes) {
                MappingTypes[MappingTypes["mapTo"] = 0] = "mapTo";
                MappingTypes[MappingTypes["routeTo"] = 1] = "routeTo";
                MappingTypes[MappingTypes["collectFrom"] = 2] = "collectFrom";
            })(MappingTypes || (MappingTypes = {}));
            class MappingType {
            }
            mappings = {
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
            exports_4("MappingDisplay", MappingDisplay = ({ term, mappingType, mapping = [], taxonomy }) => !!mapping.length &&
                React.createElement("div", {className: "mapping-group"}, React.createElement("span", {className: "mapping-terms"}, mapping.map(map => React.createElement("span", {key: map, className: "mapped-term-name"}, React.createElement("i", {className: `fa fa-${mappings[mappingType].icon}`, "aria-hidden": "true"}), taxonomy.getTerm(map).description)))));
            class TermDisplay extends react_1.Component {
                constructor(props, context) {
                    super(props, context);
                    this.state = { isOpen: false };
                }
                handleClick() {
                    this.setState({ isOpen: true });
                }
                render() {
                    const setIsOpen = (v) => () => this.setState({ isOpen: v });
                    const OpenLevel = () => React.createElement("span", {class: "size-1", onClick: setIsOpen(true)}, "(+)");
                    const CloseLevel = () => React.createElement("span", {class: "size-1", onClick: setIsOpen(false)}, "(-)");
                    const taxonomy = this.context.taxonomyStore.data;
                    var term = this.props.term;
                    this.context.taxonomyStore.loadUsageCount(term);
                    return React.createElement("div", null, React.createElement("div", {className: "term-item"}, React.createElement("span", {className: "size-20"}, React.createElement("span", {className: "size-1"}, !this.state.isOpen && term.hasChildren && React.createElement(OpenLevel, null), this.state.isOpen && React.createElement(CloseLevel, null)), React.createElement("span", {className: "term-name", style: { 'paddingLeft': 10 * (term.asHierarchy.length - 1) }}, term.description), React.createElement("span", {className: "term-count"}, term.usageCount && term.usageCount.toLocaleString())), React.createElement("span", {className: "size-30"}, React.createElement(MappingDisplay, {mappingType: MappingTypes.mapTo, term: term, mapping: term.mapTo, taxonomy: taxonomy}), React.createElement(MappingDisplay, {mappingType: MappingTypes.routeTo, term: term, mapping: term.routeTo, taxonomy: taxonomy}), React.createElement(MappingDisplay, {mappingType: MappingTypes.collectFrom, term: term, mapping: term.collectFrom, taxonomy: taxonomy}))), this.state.isOpen && React.createElement(TermList, {terms: term.children, showHeader: false}));
                }
            }
            TermDisplay.contextTypes = {
                taxonomyStore: React.PropTypes.object.isRequired
            };
            exports_4("TermDisplay", TermDisplay);
        }
    }
});
System.register("Application", ['react', 'react-dom', "components/TermDisplay", "Store", 'react-router'], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var React, react_2, react_dom_1, TermDisplay_1, Store_1, react_router_1;
    var NavLink, NavMenu, Home, TaxonomyDisplay, TaxonomyRegion, Application;
    return {
        setters:[
            function (React_2) {
                React = React_2;
                react_2 = React_2;
            },
            function (react_dom_1_1) {
                react_dom_1 = react_dom_1_1;
            },
            function (TermDisplay_1_1) {
                TermDisplay_1 = TermDisplay_1_1;
            },
            function (Store_1_1) {
                Store_1 = Store_1_1;
            },
            function (react_router_1_1) {
                react_router_1 = react_router_1_1;
            }],
        execute: function() {
            class NavLink extends react_2.Component {
                render() {
                    return React.createElement(react_router_1.Link, __assign({}, this.props, {activeClassName: "active"}));
                }
            }
            exports_5("NavLink", NavLink);
            NavMenu = ({  }) => React.createElement("ul", null, React.createElement("li", null, React.createElement(NavLink, {to: "/GB"}, "GB Taxonomy"), " "), React.createElement("li", null, React.createElement(NavLink, {to: "/US"}, "US Taxonomy")));
            class Home extends react_2.Component {
                render() {
                    return React.createElement("div", null, React.createElement("div", null, "Home"), React.createElement("div", null, this.props.children));
                }
            }
            exports_5("Home", Home);
            class TaxonomyDisplay extends react_2.Component {
                constructor(...args) {
                    super(...args);
                    this.handleStoreUpdate = () => {
                        this.forceUpdate();
                    };
                }
                componentDidMount() {
                    console.log("@@@TD mount", this.props.params.country);
                    Store_1.getTaxonomyStore(this.props.params.taxonomy).on("changed", () => this.handleStoreUpdate());
                    Store_1.getTaxonomyStore(this.props.params.taxonomy).load();
                }
                getChildContext() {
                    const childContext = {
                        taxonomyStore: Store_1.getTaxonomyStore(this.props.params.taxonomy)
                    };
                    return childContext;
                }
                render() {
                    return React.createElement("div", null, React.createElement("div", null, "TD"), React.createElement("div", null, this.props.children));
                }
            }
            TaxonomyDisplay.childContextTypes = {
                taxonomyStore: React.PropTypes.object.isRequired
            };
            exports_5("TaxonomyDisplay", TaxonomyDisplay);
            class TaxonomyRegion extends react_2.Component {
                render() {
                    const taxonomy = this.context.taxonomyStore.data;
                    const terms = taxonomy.getRootTerms(this.props.params.country);
                    return React.createElement("div", null, React.createElement("div", null, "TR"), React.createElement("div", null, React.createElement(TermDisplay_1.TermList, {terms: terms, showHeader: true})));
                }
            }
            TaxonomyRegion.contextTypes = {
                taxonomyStore: React.PropTypes.object.isRequired
            };
            exports_5("TaxonomyRegion", TaxonomyRegion);
            class Application extends react_2.Component {
                constructor(props, context) {
                    super(props, context);
                    console.log("@@@", context, this.context, this.state);
                    //this.context
                }
                click() {
                    console.log(this);
                }
                componentDidMount() {
                    return __awaiter(this, void 0, void 0, function* () {
                    });
                }
                render() {
                    return React.createElement("div", null, React.createElement(NavMenu, null), this.props.children);
                }
            }
            Application.contextTypes = {
                router: React.PropTypes.object.isRequired
            };
            exports_5("Application", Application);
            react_dom_1.render((React.createElement(react_router_1.Router, {history: react_router_1.hashHistory}, React.createElement(react_router_1.Route, {path: "/"}, React.createElement(react_router_1.IndexRoute, {component: Home}), React.createElement(react_router_1.Route, {path: "/:taxonomy", component: TaxonomyDisplay}, React.createElement(react_router_1.Route, {path: "/:taxonomy/:country", component: TaxonomyRegion}))))), document.getElementById('container'));
        }
    }
});
//# sourceMappingURL=application.js.map