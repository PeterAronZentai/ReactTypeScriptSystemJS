
export const indexById = (p, c) => (p[c.id] = c) && p

export const asArray = (obj) => Object.keys(obj).map(key => obj[key])

function cloneShallow(arr) {
  return arr.map(item => {
    let clone = {}
    Object.keys(item).forEach(k => { clone[k] = item[k] })
    return clone
  })
}

function nonEmptyArray(a) {
  return Array.isArray(a) ? a.length : !!a
}


export class Taxonomy {

  public regions: any
  private idIndex: any
  private fqnIndex: any
  private fuzzyIndex: any
  public config: any

  constructor(public name, private data = null) {
    this.config = { regions: ['Common', 'GB', 'US', 'AU'] }
    this.regions = {}
    this.idIndex = {}
    this.fqnIndex = {}
    this.fuzzyIndex = {}
    this.buildUp(data)
  }

  buildUp(data = null) {
    this.ensureData(data)
    this.buildUpRegions()
    this.applyMappings()
  }

  ensureData(data = null) {
    if (data) {
      this.data = data
      return
    }
  }

  buildUpRegions() {
    this.config.regions.forEach(this.buildUpRegion.bind(this))
  }

  buildUpRegion(region) {
    var terms = this.data.filter(item => item.country === region)
    var termsIndex = terms.reduce( (p, c) => (p[c.id] = c) && p, {})
    var descriptionIndex = terms.reduce( (p, c) => (p[c.description] = c) && p, {})
    var legacyIndex = {}
    terms.forEach( term => {
      var oldIds = [].concat(term.legacyId || term.oldIds || [])
      oldIds.forEach(oldId => {
        legacyIndex[oldId] = term
      })
    })

    var parentIndex = {}
    terms.forEach(term => {
      this.idIndex[term.id] = term
      let key = term.parentId ? term.parentId : "$root"
      var children = (parentIndex[key] = parentIndex[key] || [])
      children.push(term)
    })

    var fuzzyIndex = {}

    this.regions[region] = { terms, termsIndex, parentIndex, descriptionIndex, legacyIndex, fuzzyIndex}

    terms.forEach(term => {
      this.fqnIndex[createTerm(this, term).fullyQualifiedName] = term
    })

    terms.forEach(term => {
      this.fuzzyIndex[term.id] = this.fuzzyIndex[term.fullyQualifiedName.toLowerCase()] = term
      fuzzyIndex[term.id] = fuzzyIndex[term.fullyQualifiedName.toLowerCase()] = term
      if (term.asHierarchy.length <3) {
        var key = (term.description || "").toLowerCase()
        this.fuzzyIndex[key] = term
        fuzzyIndex[key] = term
      }
    })
  }

  getFromLegacyId(region, id) {
    return this.regions[region].legacyIndex[id]
  }

  getFromFqn(fqn) {
    return createTerm(this, this.fqnIndex[fqn])
  }

  getFuzzyByRegion(region, someid) {
    var term = this.regions[region].fuzzyIndex[someid.toLowerCase()]
    return createTerm(this, term)
  }

  getFuzzy(someId) {
    var key = (someId + "").toLowerCase()
    return createTerm(this, this.fuzzyIndex[key])
  }

  getFromDescription(region, description) {
    let term
    if (this.regions[region]) {
      term = this.regions[region].descriptionIndex[description]
    }
    if (term) {
      return createTerm(this, term)
    }
  }

  applyMappings() {
    this.config
      .regions
      .filter( i => i !== "Common")
      .forEach(this.applyRegionalToCommon.bind(this))
  }

  applyRegionalToCommon(region) {
    this.regions[region].terms.forEach( term => {
      if (term.mapTo) {
        let ids = [].concat(term.mapTo)
        ids.forEach(this.mapTermOnCommon.bind(this, term))
      } else {
        //todo uncomment when mapping is done
        //logger.warn("Term not mapped...")
      }
      if (term.collectFrom) {
        let ids = [].concat(term.collectFrom)
        ids.forEach(this.collectTermFromCommon.bind(this, term))
      }
    })
  }

  mapTermOnCommon(term, ctermId) {
    var cterm = this.getCTerm(ctermId)
    if (!cterm) {
      //todo uncomment when mapping is done
      //logger.warn(`Missing common term  ${ctermId} when mapping ${term.description} ${term.country}`)
      //throw new TypeError("missing cterm " + ctermId)
      return;
    }
    var region = term.country
    cterm.mapsFrom = cterm.mapsFrom || {}
    let termIds = cterm.mapsFrom[region] = (cterm.mapsFrom[region] || [])
    if (termIds.indexOf(term.id) < 0) {
      termIds.push(term.id)
    }
  }

  collectTermFromCommon(term, ctermId) {
    var cterm = this.getCTerm(ctermId)
    if (!cterm) {
      throw new TypeError("missing cterm " + ctermId)
    }
    var region = term.country
    cterm.collectsTo = cterm.collectsTo || {}
    let termIds = cterm.collectsTo[region] = (cterm.collectsTo[region] || [])
    if (termIds.indexOf(term.id) < 0) {
      termIds.push(term.id)
    }
  }

  getRootTerms(region): Array<Term> {
    return (this.regions[region]
      .parentIndex
      .$root || [])
      .map( term => createTerm(this, term))
  }

  getParent(term) {
    return this.getTerm(term.country, term.parentId)
  }

  getChildren(term) {
    return [].concat(this.regions[term.country].parentIndex[term.id] || [])
      .map( term => createTerm(this, term))
  }

  getAllTerms(region) {
    return this.regions[region].terms
      .map(term => createTerm(this, term))
  }

  getTerm(region?, termId?): Term {
    if (arguments.length === 1) {
      if ("object" === typeof region) {
        return this.getTerm(region.country, region.id)
      }
      return createTerm(this, this.idIndex[region])
    }
    return createTerm(this, this.regions[region].termsIndex[termId])
  }

  getCTerm(termId) {
    return this.getTerm("Common", termId)
  }

  getRegionalTerms(region, cterm) {
    var ct = cterm
    while(ct) {
      if (ct.mapsFrom && ct.mapsFrom[region]) {
        let res = [].concat(ct.mapsFrom[region]).map(this.getTerm.bind(this, region))
        return res
      }
      if (ct.collectsTo && ct.collectsTo[region]) {
        let res = [].concat(ct.collectsTo[region]).map(this.getTerm.bind(this, region))
        return res
      }
      ct = this.getParent(ct)
    }
    //uncomment when mapping is done
    // logger.warn(`Can't resolve ${cterm.description}:${cterm.id} to ${region}`)
    return []
  }


  getCommonTerms(term) {

    if (!term) return []
    if (term.country === "Common") {
      return [term]
    }

    if (nonEmptyArray(term.mapTo)) {
      return [].concat(term.mapTo).map(this.getCTerm.bind(this))
    }
    if (nonEmptyArray(term.routeTo)) {
      return [].concat(term.routeTo).map(this.getCTerm.bind(this))
    }
    return this.getCommonTerms(this.getParent(term))
  }

  getMap(region, term) {
    if (region === term.country) {
      return [].concat(term)
    }
    const cterms = this.getCommonTerms(term)
    if (region === "Common") return cterms

    const rterms = cterms
      .map(term => this.getRegionalTerms(region, term))
      .reduce( (p, c) => p.concat(c), [])
      .map(term => createTerm(this, term))
      .reduce(indexById, {})

    return asArray(rterms)
  }

  getTermsForAllRegions(term) {
    var result = {}
    this.config.regions.forEach(r => result[r] = this.getMap(r, term))
    return result
  }

  resolveAllTerms(terms) {
    var regionHashes = [];
    [].concat(terms).forEach( term => {
      regionHashes.push(this.getTermsForAllRegions(term))
    });
    var combined = {}
    regionHashes.forEach(hash => {
      Object.keys(hash).forEach(key => {
        combined[key] = combined[key] || []
        combined[key] = combined[key].concat(hash[key])
      })
    })
    Object.keys(combined).forEach( key => {
      combined[key] = asArray(combined[key].reduce(indexById, {}))
    })
    return combined
  }

  getChain(term) {
    var t = term, terms = [t]
    while(t = this.getTerm(t.country, t.parentId)) {
      terms = terms.concat(t)
    }
    return terms
  }
  walkDown(term, cb) {
    this.getChain(term).reverse().forEach(cb)
  }

  walkUp(term, cb) {
    this.getChain(term).forEach(cb)
  }

  /** term specific */
  resolveTermIdForRegion(termId, outputRegion) {
    const term = this.getTerm(termId, undefined)
    if (!term) throw new Error("Invalid term id: " + termId + " in taxonomy: " + this.name)
    return term.getMapped(outputRegion)
  }

  /** v4 resource specific */
  getTerms(resource, region) {
    return [].concat(resource[this.name])
      .filter( item => region ? item.country === region : true )
      .map( item => this.getTerm(item, undefined) )
  }

}

type RegionMap = { [key:string]: Array<number> }
export class Term {
  public id: number;
  public description: string;
  public country: string;
  public parentId: number;
  public mapTo: Array<number>;
  public routeTo: Array<number>;
  public collectFrom: Array<number>;
  public taxonomy: Taxonomy
  public usageCount: number;
  public usageCountLoaded: boolean = false;
  public mapsFrom: RegionMap;
  public collectsTo: RegionMap;
  public isOpen: boolean = false;
  getMapped(region?) {
    if (region) return this.taxonomy.getMap(region, this)
    return this.taxonomy.getTermsForAllRegions(this)
  }

  get hasMapping() {
    return !!((this.mapTo && this.mapTo.length) || (this.routeTo && this.routeTo.length))
  }

  get isCommon() {
    return !this.country || this.country === "Common"
  }

  get hasParent() {
    return !!this.parentId
  }

  get parent() {
    if (!this.hasParent) return
    return  this.taxonomy.getTerm(this.country, this.parentId)
  }

  get children() {
    return this.taxonomy.getChildren(this)
  }

  get hasChildren() {
    return !!(this.taxonomy.getChildren(this) || []).length
  }

  get pathName() {
    return this.asHierarchy.map(t => t.description).join(" / ")
  }

  get asHierarchy() {
    if (!this.hasParent) return [this]
    return [...this.parent.asHierarchy, this]
  }

  get fullyQualifiedName() {
    const h = this.asHierarchy
    return [this.country,h.length - 1, ...h.map(i => i.description), undefined].join("|")
  }

  toString() {
    return "TERM:" + this.id
  }

  get level() {
    return this.asHierarchy.length
  }

  static createTerm<T extends Term>(taxonomy: Taxonomy, init: any, t: new() => T): T {
    if (!init) return
    if (init instanceof t) return init

    var result = Object.setPrototypeOf(init, t.prototype)
    Object.defineProperty(init, "taxonomy", {
      enumerable: false,
      value: taxonomy
    })
    return <T>result
  }

}

export const createTerm = (taxonomy, init) => {
  if (!init) return
  if (init instanceof Term) return init


  var result = Object.setPrototypeOf(init, Term.prototype)
  Object.defineProperty(init, "taxonomy", {
    enumerable: false,
    value: taxonomy
  })
  return result
}

