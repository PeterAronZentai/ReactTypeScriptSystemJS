import * as React from 'react'
import { Component } from 'react'
import { Term } from './Taxonomy'
import { getTaxonomyStore  } from './Store'


const TermListHeader = ({country }) => {
const otherCountries = ['GB','US','AU'].filter( c => c !== country)
return <div className="term-list">
  <div className="term-list-header">
    <span className="size-20">Source term ({country})</span>
    {country !== 'Common' && <span className="mapping-column mapping-column-header size-20">Terget term (Common)</span>}
    <span className="mapping-result size-10">Results</span>
  </div>
  <div className="term-list-subheader">
    <span className="size-20"></span>
    {country !== 'Common' && <span className="mapping-column mapping-column-header size-20"></span> }
    {otherCountries.map( oc => <span key={oc} className="mapping-result size-10">{oc}</span>)}
  </div>
</div>
}
export type TermListProps = {terms:Array<Term>, showHeader:boolean, country: string}
export const TermList = ({terms, showHeader = true, country = 'GB'}: TermListProps) =>
//.sort( (a, b) => a.description < b.description ? -1 : 1)
<div>
  { showHeader && <TermListHeader country={country} /> }
  { terms.map(term => <TermDisplay key={term.id} term={term} />)}
</div>



enum MappingTypes {
  mapTo,
  routeTo,
  collectFrom
}

class MappingType {
  name: string
  icon: string
}

const mappings: { [key: number] : MappingType } = {
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
}

interface IMappingDisplayArgs {
  mappingType: MappingTypes,
  term: Term
}

export const MappingDisplay = ({term, mappingType }:IMappingDisplayArgs) => {
const mapping = term[MappingTypes[mappingType]] || []
return (
  <div className="mapping-group">
    <span className="mapping-terms">
      {mapping.map(map =>
      <span key={map}  className="mapped-term-name">
          <i className={`fa fa-${mappings[mappingType].icon}`} aria-hidden="true"></i>
          {term.taxonomy.getTerm(map).pathName}
    </span>)}
    </span>
  </div>)
}


export type MappingResultProps = { term: Term, country: string, mappingResult: Array<Term> }

export const MappingResult = ({term, country, mappingResult}:MappingResultProps) =>
<span className="size-10 mapping-result">
  {mappingResult.map(result =>
      <span key={result.id} className="mapped-term-name">{result.pathName}</span>)}
</span>

export class TermDisplay extends Component<{term: Term},{isOpen: boolean}> {

  constructor(props, context) {
    super(props, context)
    this.state = { isOpen: false }
  }

  handleClick() {
    this.setState({isOpen: true})
  }

  render() {
    var term = this.props.term

    const taxonomyStore  = getTaxonomyStore(term.taxonomy.name)
    // const showOpener = () => !term.isOpen && term.hasChildren
    // const showHider = () => term.isOpen
    // const setIsOpen = (v) => () => { term.isOpen = v; taxonomyStore.fireChange() };

    const showOpener = () => !this.state.isOpen && term.hasChildren
    const showHider = () => this.state.isOpen
    const setIsOpen = (v) => () => { this.setState({isOpen:v}); };

    const taxonomy = taxonomyStore.data
    const OpenLevel = () => <span class="size-1" onClick={setIsOpen(true)}>(+)</span>
    const CloseLevel = () => <span class="size-1" onClick={setIsOpen(false)}>(-)</span>

    if (term.country !== "Common") taxonomyStore.loadUsageCount(term)
    const regions = taxonomy.config.regions.filter( region => region !== term.country && region != 'Common')
    const mappedTerms = term.getMapped()
    return <div>
      <div className="term-item">

        <span className="size-20">
          <span className="size-1">
            { showOpener() && <OpenLevel /> }
            {  showHider() && <CloseLevel /> }
          </span>
          <span className="mappable-term term-name" style={{'paddingLeft': 10 * (term.asHierarchy.length - 1)}}>
              {term.description}
            </span>
            <span className="term-count">{term.usageCount && term.usageCount.toLocaleString()}</span>
        </span>
        {term.country !== 'Common' && <span className="mapping-column size-20">
          <MappingDisplay mappingType={MappingTypes.mapTo}
                          term={term} />
          <MappingDisplay mappingType={MappingTypes.routeTo}
                          term={term} />
          <MappingDisplay mappingType={MappingTypes.collectFrom}
                          term={term}  />
        </span>}
        {
          regions.map(regionName => <MappingResult key={regionName} term={term} country={regionName} mappingResult={mappedTerms[regionName]} />)
        }
      </div>
      {this.state.isOpen && <TermList terms={term.children} showHeader={false} />}
    </div>
  }
}