//Marco global
import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Landing from './Landing';

class App extends Component {

  //Eventos de carga inicial de la React
  componentDidMount(){
    this.props.checkApiUrl();
    this.props.checkToken();
  }

  render(){
      return(
        <Landing />
      );
    }
};

export default connect(null, actions)(App);
