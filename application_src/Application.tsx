/// <reference path="../typings/index.d.ts" />
import * as React from 'react'
import { Component, ComponentLifecycle, ReactPropTypes, ValidationMap } from 'react'
import { render as domRender } from 'react-dom'
import { TermDisplay, TermList } from './TermDisplay'
import { getTaxonomyStore, getTermStore, TaxonomyStore } from './Store'
import { Taxonomy, Term } from './Taxonomy'
import { Router, Route, Link, hashHistory, IndexRoute, RouteComponentProps, Redirect } from 'react-router'


interface HashOf<T> { [key:string]: T}


export class NavLink extends Component<any, any> {
  render() {
    return <Link {...this.props} activeClassName="active" />
  }
}

const NavMenu = ({}) =>
<ul className="menu taxonomy-menu">
  <li className="menu-head">category >></li>
  <li><NavLink to="/subjects" >Subject</NavLink> </li>
  <li><NavLink to="/ages">Age</NavLink></li>
  <li><NavLink to="/attachment-types">Attachment</NavLink></li>
</ul>

const CountryMenu = ({ parent }) =>
<ul className="menu country-menu">
  <li className="menu-head">region >></li>
  <li><NavLink to={`${parent}/GB`}>United Kingdom</NavLink> </li>
  <li><NavLink to={`${parent}/US`}>United States</NavLink></li>
  <li><NavLink to={`${parent}/AU`}>Australia</NavLink></li>
  <li><NavLink to={`${parent}/Common`}>Common</NavLink></li>
</ul>

const TaxonomyViewTemplate = ({ terms, country, taxonomy}) =>
<div>
  <div className="menu-bar">
    <NavMenu />
    <CountryMenu parent={taxonomy.name} />
  </div>
  <div className="workspace">
    <TermList terms={terms} showHeader={true}  country={country}/>
  </div>
</div>


export class Home extends Component<{taxonomyStore:any}, any> {
  render() {
    return <div>
      <div>Home</div>
      <div>{this.props.children}</div>
    </div>
  }
}

export type TaxonomySpecification = {taxonomy:string, country?: string}

export type TaxonomyViewProps = RouteComponentProps<TaxonomySpecification, TaxonomySpecification>;


export class TaxonomyView extends Component<TaxonomyViewProps, any>
                             implements ComponentLifecycle<TaxonomyViewProps, any> {

  private handleStoreUpdate = () => {
    setTimeout( () =>this.forceUpdate(), 0);
  }

  private subscriptions: HashOf<{() : any}> = { }

  componentWillReceiveProps(nextProps: TaxonomyViewProps, nextContext) {
    if (nextProps.routeParams.taxonomy !== this.props.routeParams.taxonomy) {
      this.subscribeToStore(nextProps.routeParams.taxonomy)
    }
  }

  subscribeToStore(taxonomyName) {
    const taxonomyStore = getTaxonomyStore(taxonomyName)
    this.subscriptions[taxonomyName] = this.subscriptions[taxonomyName] || taxonomyStore.on("changed", () => this.handleStoreUpdate())
    taxonomyStore.load()
  }

  componentDidMount() {
    this.subscribeToStore(this.props.params.taxonomy)
  }

  get taxonomyStore() {
    return getTaxonomyStore(this.props.params.taxonomy)
  }


  render() {
    const country = this.props.params.country
    const taxonomy = this.taxonomyStore.data
    const terms = country && taxonomy && taxonomy.getRootTerms(country) || []
    const viewProps = { country, taxonomy,  terms}
    return <TaxonomyViewTemplate {...viewProps}/>
  }
}

export class Application extends Component<any, any> {
  render() {
    return <div>
            {this.props.children}
          </div>
  }
}

domRender((
  <Router history={hashHistory}>
    <Redirect from="/" to="/subjects/GB" />
    <Route path="/" component={Application}>
      <IndexRoute component={Home} />
      <Redirect from="/:taxonomy" to="/:taxonomy/GB" />
      <Route path="/:taxonomy">
        <Route path="/:taxonomy/:country" component={TaxonomyView}>
        </Route>
      </Route>
    </Route>
  </Router>
), document.getElementById('container'))
