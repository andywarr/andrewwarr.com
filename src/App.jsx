import React from 'react';

import './App.css';

import Section1 from './Section1';
import Section2 from './Section2';

export default class App extends React.Component {

  render() {
      return (
          <div>
            <Section1 />
            <Section2 />
          </div>
      );
  }
}
