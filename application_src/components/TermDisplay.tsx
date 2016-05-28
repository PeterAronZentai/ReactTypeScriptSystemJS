import * as React from 'react'
import { Component, ValidationMap } from 'react'
import { Term } from '../entities/Term'
import { Taxonomy } from '../entities/Taxonomy'
import { TaxonomyRegionContext } from '../Application'


const TermListHeader = ({country }) =>
<div className="term-list">
  <div className="term-list-header">
    <span className="size-20">{country} term</span>
    <span className="size-30">Mapping to common</span>
    <span className="size-15">Result</span>
  </div>
  <div className="term-list-subheader">
    <span className="size-20">Name</span>
    <span className="size-10">MapTo</span>
    <span className="size-10">RouteTo</span>
    <span className="size-10">CollectFrom</span>
  </div>
</div>

export const TermList = ({terms, showHeader = true}) =>
<div>
  { showHeader && <TermListHeader country="US" /> }
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
  taxonomy: Taxonomy,
  mapping: Array<Number>,
  term: Term
}

export const MappingDisplay = ({term, mappingType, mapping = [], taxonomy }:IMappingDisplayArgs) =>
!!mapping.length &&
<div className="mapping-group">

  <span className="mapping-terms">
    {mapping.map(map =>
     <span key={map}  className="mapped-term-name">
        <i className={`fa fa-${mappings[mappingType].icon}`} aria-hidden="true"></i>
        {taxonomy.getTerm(map).description}
   </span>)}
  </span>
</div>



export class TermDisplay extends Component<{term: Term},{isOpen: boolean}> {

  constructor(props, context) {
    super(props, context)
    this.state = { isOpen: false }
  }

  handleClick() {
    this.setState({isOpen: true})
  }

  static contextTypes:  ValidationMap<TaxonomyRegionContext> = {
    taxonomyStore: React.PropTypes.object.isRequired
  }

  context: TaxonomyRegionContext

  render() {
    const setIsOpen = (v) => () => this.setState({isOpen:v})

    const OpenLevel = () => <span class="size-1" onClick={setIsOpen(true)}>(+)</span>
    const CloseLevel = () => <span class="size-1" onClick={setIsOpen(false)}>(-)</span>

    const taxonomy = this.context.taxonomyStore.data
    var term = this.props.term
    this.context.taxonomyStore.loadUsageCount(term)
    return <div>
      <div className="term-item">

        <span className="size-20">
          <span className="size-1">
            {!this.state.isOpen && term.hasChildren && <OpenLevel /> }
            {this.state.isOpen && <CloseLevel /> }
          </span>
          <span className="term-name" style={{'paddingLeft': 10 * (term.asHierarchy.length - 1)}}>
              {term.description}
            </span>
            <span className="term-count">{term.usageCount && term.usageCount.toLocaleString()}</span>
        </span>
        <span className="size-30">
          <MappingDisplay mappingType={MappingTypes.mapTo}
                          term={term}
                          mapping={term.mapTo}
                          taxonomy={taxonomy} />
          <MappingDisplay mappingType={MappingTypes.routeTo}
                          term={term}
                          mapping={term.routeTo}
                          taxonomy={taxonomy} />
          <MappingDisplay mappingType={MappingTypes.collectFrom}
                          term={term}
                          mapping={term.collectFrom}
                          taxonomy={taxonomy} />
        </span>
      </div>
      {this.state.isOpen && <TermList terms={term.children} showHeader={false} />}
    </div>
  }
}