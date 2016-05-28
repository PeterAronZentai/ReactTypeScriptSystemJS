/// <reference path="../typings/index.d.ts" />
import * as React from 'react'
import { Component, ComponentLifecycle, ReactPropTypes, ValidationMap } from 'react'
import { render as domRender } from 'react-dom'
import { TermDisplay, TermList } from './components/TermDisplay'
import { getTaxonomyStore, getTermStore, TaxonomyStore } from './Store'
import { Taxonomy } from './entities/Taxonomy'
import { Term } from './entities/Term'
import { Router, Route, Link, hashHistory, IndexRoute, RouteComponentProps } from 'react-router'



export class NavLink extends Component<any, any> {
  render() {
    return <Link {...this.props} activeClassName="active"/>
  }
}

const NavMenu = ({}) => <ul>
<li><NavLink to="/GB">GB Taxonomy</NavLink> </li>
<li><NavLink to="/US">US Taxonomy</NavLink></li>
</ul>

export class Home extends Component<{taxonomyStore:any}, any> {
  render() {
    return <div>
      <div>Home</div>
      <div>{this.props.children}</div>
    </div>
  }
}


export type TaxonomyRegionContext = {taxonomyStore: TaxonomyStore}

export type TaxonomyDisplayProps = RouteComponentProps<{taxonomy:string, country: string},
                                                       {taxonomy: string}>;


export class TaxonomyDisplay extends Component<TaxonomyDisplayProps, any> {

  private handleStoreUpdate = () => {
    this.forceUpdate()
  }


  componentDidMount() {
    console.log("@@@TD mount", this.props.params.country)
    getTaxonomyStore(this.props.params.taxonomy).on("changed", () => this.handleStoreUpdate())
    getTaxonomyStore(this.props.params.taxonomy).load()
  }

  static childContextTypes: ValidationMap<TaxonomyRegionContext> = {
    taxonomyStore: React.PropTypes.object.isRequired
  }

  getChildContext() {
    const childContext = {
      taxonomyStore : getTaxonomyStore(this.props.params.taxonomy)
    }
    return childContext
  }

  render() {
    return <div>
      <div>TD</div>
      <div>{this.props.children}</div>
    </div>
  }

}

type TaxonomyRegionProps = RouteComponentProps<{taxonomy:string, country: string}, {taxonomy:string, country: string}>


export class TaxonomyRegion extends Component<TaxonomyRegionProps, any> {

  static contextTypes: ValidationMap<TaxonomyRegionContext> = {
    taxonomyStore: React.PropTypes.object.isRequired
  }

  context: TaxonomyRegionContext

  render() {
    const taxonomy = this.context.taxonomyStore.data
    const terms = taxonomy.getRootTerms(this.props.params.country)
    return <div>
      <div>TR</div>
      <div>
        <TermList terms={terms} showHeader={true} />
      </div>
    </div>
  }
}

export class Application extends Component<any, any> {
  click() {
    console.log(this)
  }

  constructor(props, context) {
    super(props, context)
    console.log("@@@", context, this.context, this.state)
    //this.context
  }


  async componentDidMount() {

  }


  static contextTypes: ValidationMap<any> = {
    router: React.PropTypes.object.isRequired
  };

  render() {
    return <div>
            <NavMenu />
            {this.props.children}
          </div>

  }
}


domRender((
  <Router history={hashHistory}>
    <Route path="/" >
      <IndexRoute component={Home} />
      <Route path="/:taxonomy" component={TaxonomyDisplay}>
        <Route path="/:taxonomy/:country" component={TaxonomyRegion} />
      </Route>
    </Route>
  </Router>
), document.getElementById('container'))
