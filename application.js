var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
System.register("entities/Taxonomy", ["entities/Term", "Store", "entities/Subject"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Term_1, Store_1, Subject_1;
    var indexById, asArray, Taxonomy, TaxonomyStore, subjectTaxonomyStore;
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
            },
            function (Store_1_1) {
                Store_1 = Store_1_1;
            },
            function (Subject_1_1) {
                Subject_1 = Subject_1_1;
            }],
        execute: function() {
            exports_1("indexById", indexById = (p, c) => (p[c.id] = c) && p);
            exports_1("asArray", asArray = (obj) => Object.keys(obj).map(key => obj[key]));
            class Taxonomy {
                constructor(name, data = null) {
                    this.name = name;
                    this.data = data;
                    this.name = name;
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
            class TaxonomyStore extends Store_1.Store {
                constructor(upstream) {
                    super();
                    this.data = new Taxonomy('subject', []);
                    upstream.on("changed", () => {
                        this.data = new Taxonomy('subjects', upstream.data);
                    });
                }
            }
            exports_1("TaxonomyStore", TaxonomyStore);
            exports_1("subjectTaxonomyStore", subjectTaxonomyStore = new TaxonomyStore(Subject_1.subjectStore));
        }
    }
});
System.register("entities/Term", ["entities/Taxonomy"], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var Taxonomy_1;
    var Term, createTerm;
    return {
        setters:[
            function (Taxonomy_1_1) {
                Taxonomy_1 = Taxonomy_1_1;
            }],
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
                loadUsageCount() {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!this.usageCountLoaded) {
                            this.usageCountLoaded = true;
                            var searchHost = 'http://service-resource-search.service.live.tescloud.com/api/search/v4/term-counts';
                            var query = `subject-ids=${this.id}&displayCountry=${this.country}`;
                            var response = yield fetch(`${searchHost}?${query}`);
                            var data = yield response.json();
                            this.usageCount = (data.response.subjects[0] || {}).count;
                            Taxonomy_1.subjectTaxonomyStore.emit("changed");
                        }
                    });
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
System.register("entities/Subject", ["Store", "entities/Term"], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    var Store_2, Term_3;
    var Subject, SubjectStore, subjectStore;
    return {
        setters:[
            function (Store_2_1) {
                Store_2 = Store_2_1;
            },
            function (Term_3_1) {
                Term_3 = Term_3_1;
            }],
        execute: function() {
            class Subject extends Term_3.Term {
            }
            exports_3("Subject", Subject);
            class SubjectStore extends Store_2.Store {
                constructor(...args) {
                    super(...args);
                    this._items = [];
                }
                setDefault() {
                    this.data = [];
                }
                loadInternal() {
                    return __awaiter(this, void 0, void 0, function* () {
                        var response = yield fetch('/data/resource-subjects.json');
                        var data = yield response.json();
                        return data;
                    });
                }
            }
            exports_3("SubjectStore", SubjectStore);
            exports_3("subjectStore", subjectStore = new SubjectStore());
        }
    }
});
System.register("Store", ['events'], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    var events_1;
    var Store;
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            }],
        execute: function() {
            class Store extends events_1.EventEmitter {
                constructor() {
                    super();
                }
                get data() {
                    return this._data;
                }
                set data(v) {
                    this._data = v;
                    this.emit("changed");
                }
                setDefault() {
                    throw new Error("pure func called. implementation missing");
                }
                loadInternal() {
                    return __awaiter(this, void 0, Promise, function* () {
                        throw new Error("pure func called. implementation missing");
                    });
                }
                load() {
                    return __awaiter(this, void 0, void 0, function* () {
                        //this.setDefault()
                        this.data = yield this.loadInternal();
                    });
                }
            }
            exports_4("Store", Store);
        }
    }
});
System.register("components/TermDisplay", ['react', "entities/Taxonomy"], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var React, react_1, Taxonomy_2;
    var TermListHeader, TermList, MappingTypes, MappingType, mappings, MappingDisplay, TermDisplay;
    return {
        setters:[
            function (React_1) {
                React = React_1;
                react_1 = React_1;
            },
            function (Taxonomy_2_1) {
                Taxonomy_2 = Taxonomy_2_1;
            }],
        execute: function() {
            TermListHeader = ({ country }) => React.createElement("div", {className: "term-list"}, React.createElement("div", {className: "term-list-header"}, React.createElement("span", {className: "size-20"}, country, " term"), React.createElement("span", {className: "size-30"}, "Mapping to common"), React.createElement("span", {className: "size-15"}, "Result")), React.createElement("div", {className: "term-list-subheader"}, React.createElement("span", {className: "size-20"}, "Name"), React.createElement("span", {className: "size-10"}, "MapTo"), React.createElement("span", {className: "size-10"}, "RouteTo"), React.createElement("span", {className: "size-10"}, "CollectFrom")));
            exports_5("TermList", TermList = ({ terms, showHeader = true }) => React.createElement("div", null, showHeader && React.createElement(TermListHeader, {country: "US"}), terms.map(term => React.createElement(TermDisplay, {key: term.id, term: term}))));
            (function (MappingTypes) {
                MappingTypes[MappingTypes["mapTo"] = 0] = "mapTo";
                MappingTypes[MappingTypes["routeTo"] = 1] = "routeTo";
                MappingTypes[MappingTypes["collectFrom"] = 2] = "collectFrom";
            })(MappingTypes || (MappingTypes = {}));
            class MappingType {
            }
            mappings = {
                [MappingTypes.mapTo]: { name: MappingTypes[MappingTypes.mapTo], icon: "exchange" },
                [MappingTypes.routeTo]: { name: MappingTypes[MappingTypes.routeTo], icon: "random" },
                [MappingTypes.collectFrom]: { name: MappingTypes[MappingTypes.collectFrom], icon: "long-arrow-left" }
            };
            exports_5("MappingDisplay", MappingDisplay = ({ term, mappingType, mapping = [], taxonomy }) => !!mapping.length &&
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
                    var term = this.props.term;
                    term.loadUsageCount();
                    return React.createElement("div", null, React.createElement("div", {className: "term-item"}, React.createElement("span", {className: "size-20"}, React.createElement("span", {className: "size-1"}, !this.state.isOpen && term.hasChildren && React.createElement(OpenLevel, null), this.state.isOpen && React.createElement(CloseLevel, null)), React.createElement("span", {className: "term-name", style: { 'paddingLeft': 10 * (term.asHierarchy.length - 1) }}, term.description), React.createElement("span", {className: "term-count"}, term.usageCount && term.usageCount.toLocaleString())), React.createElement("span", {className: "size-30"}, React.createElement(MappingDisplay, {mappingType: MappingTypes.mapTo, term: term, mapping: term.mapTo, taxonomy: Taxonomy_2.subjectTaxonomyStore.data}), React.createElement(MappingDisplay, {mappingType: MappingTypes.routeTo, term: term, mapping: term.routeTo, taxonomy: Taxonomy_2.subjectTaxonomyStore.data}), React.createElement(MappingDisplay, {mappingType: MappingTypes.collectFrom, term: term, mapping: term.collectFrom, taxonomy: Taxonomy_2.subjectTaxonomyStore.data}))), this.state.isOpen && React.createElement(TermList, {terms: term.children, showHeader: false}));
                }
            }
            exports_5("TermDisplay", TermDisplay);
        }
    }
});
System.register("Application", ['react', 'react-dom', "components/TermDisplay", "entities/Subject", "entities/Taxonomy"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    var React, react_2, ReactDOM, TermDisplay_1, Subject_2, Taxonomy_3;
    var Application;
    return {
        setters:[
            function (React_2) {
                React = React_2;
                react_2 = React_2;
            },
            function (ReactDOM_1) {
                ReactDOM = ReactDOM_1;
            },
            function (TermDisplay_1_1) {
                TermDisplay_1 = TermDisplay_1_1;
            },
            function (Subject_2_1) {
                Subject_2 = Subject_2_1;
            },
            function (Taxonomy_3_1) {
                Taxonomy_3 = Taxonomy_3_1;
            }],
        execute: function() {
            class Application extends react_2.Component {
                constructor(props, context) {
                    super(props, context);
                }
                click() {
                    console.log(this);
                    Subject_2.subjectStore.load();
                }
                componentDidMount() {
                    return __awaiter(this, void 0, void 0, function* () {
                        Subject_2.subjectStore.load();
                        Taxonomy_3.subjectTaxonomyStore.on("changed", () => {
                            //var s = Term.createTerm<Subject>(subjectTaxonomyStore.data, {id:1}, Subject)
                            this.forceUpdate();
                        });
                    });
                }
                render() {
                    return React.createElement("div", null, React.createElement("button", {onClick: this.click}, "Presasdasds"), React.createElement(TermDisplay_1.TermList, {terms: Taxonomy_3.subjectTaxonomyStore.data.getRootTerms("US")}));
                }
            }
            exports_6("Application", Application);
            ReactDOM.render(React.createElement(Application, null), document.getElementById('container'));
        }
    }
});
System.register("components/SubjectDisplay", ['react'], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var React, react_3;
    var SubjectDisplay;
    return {
        setters:[
            function (React_3) {
                React = React_3;
                react_3 = React_3;
            }],
        execute: function() {
            class SubjectDisplay extends react_3.Component {
                handleClick() {
                    console.log(this);
                }
                render() {
                    return React.createElement("div", null);
                }
            }
            exports_7("SubjectDisplay", SubjectDisplay);
        }
    }
});
//# sourceMappingURL=application.js.map