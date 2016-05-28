import { Taxonomy } from './Taxonomy'

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

  get path() {
    return [this.hasParent ? this.parent.path : this.country, this.description].join("/")
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

