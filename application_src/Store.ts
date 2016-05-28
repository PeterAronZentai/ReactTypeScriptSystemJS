import { EventEmitter } from 'events'
import { Term } from './entities/Term'
import { Taxonomy } from './entities/Taxonomy'

export abstract class Store<T>  {

  protected _data: T

  protected loaded: boolean = false

  protected emitter = new EventEmitter()

  constructor() {
  }

  get data(): T {
    return this._data;
  }

  set data(v: T) {
    this._data = v
    console.log("store changed", this, v)
    this.emitter.emit("changed")
  }

  protected async loadInternal() : Promise<T> {
    throw new Error("pure func called. implementation missing")
  }

  async load(force = false) {
    if (this.loaded && !force) return
    this.loaded = true
    this.data = await this.loadInternal()
  }

  on(event:string, cb: () => any) {
    console.log("subscribing listener", this, cb.toString())
    this.emitter.on(event, cb)
    return cb
  }

  unscubscribe(event:string, cb: () => any) {
    this.emitter.removeListener(event, cb)
  }

  protected setDefault() {
    throw new Error("pure func called. implementation missing")
  }

}

interface HashOf<T> { [key:string]: T}

export class TermStore extends Store<Array<Term>> {

  constructor(public name: string) {
    super()
  }
  protected setDefault() {
    this.data = []
  }

  protected async loadInternal() {
    var response = await fetch(this.fileName)
    var data = await response.json()
    return data
  }

  get fileName():string { return `/data/resource-${this.name}.json`}
}

export const termStores : HashOf<TermStore> = {}

export const getTermStore = name => termStores[name] || (termStores[name] = new TermStore(name))

export class TaxonomyStore extends Store<Taxonomy> {
  constructor(public name: string, private upstream?: TermStore) {
    super()
    if (!upstream) {
      this.upstream = getTermStore(name)
    }
    this.data = new Taxonomy('',[])
    this.upstream.on("changed", () => {
      this.data = new Taxonomy(this.name, this.upstream.data)
    })
  }

  get taxonomy(): Taxonomy {
    return this.data
  }

  protected async loadInternal(): Promise<Taxonomy> {
    this.upstream.load()
    return Promise.resolve(this.data)
  }

  private usageCountLoaded: boolean = false

  private termCountIdNameMap: HashOf<Array<string>> = {
    'subjects':['subject','subjects'],
    'ages':['year','years']
  }

  private mapTermName(s:string) {
    console.log("namemap", s, this.termCountIdNameMap)
    return this.termCountIdNameMap[s]
  }
  async loadUsageCount(term:Term) {
    if (!term.usageCountLoaded) {
      term.usageCountLoaded = true;
      var searchHost = 'http://service-resource-search.service.live.tescloud.com/api/search/v4/term-counts'
      var query = `${this.mapTermName(this.taxonomy.name)[0]}-ids=${encodeURIComponent(term.id)}&displayCountry=${term.country}`
      var response = await fetch(`${searchHost}?${query}`)
      var data = await response.json()
      term.usageCount = (data.response[this.mapTermName(this.taxonomy.name)[1]][0] || {}).count
      this.emitter.emit("changed")
    }
  }
}

export const taxonomyStores : HashOf<TaxonomyStore> = {}

export const getTaxonomyStore = name => taxonomyStores[name] || (taxonomyStores[name] = new TaxonomyStore(name))


