import React from 'react';
import { Provider } from 'react-redux';
import { HashRouter } from 'react-router-dom';
import { IconStyle } from './assets/iconfont/iconfont';
import { renderRoutes } from 'react-router-config';
import store from './store';
import routes from './routes';
import { GlobalStyle } from './style';
import { Data } from './application/Singers/data';

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <GlobalStyle />
        <IconStyle />
        <Data>
          {
            renderRoutes(routes)
          }
        </Data>
      </HashRouter>
    </Provider>

  );
}

export default App;
