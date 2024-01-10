import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Todo from './pages/Todo';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Report from './pages/Report';

setupIonicReact();

import { Provider } from 'react-redux';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/home" component={Home} exact={true} />
        <Route path="/todo" component={Todo} exact={true} />
        <Route path="/profile" component={Profile}/>
        <Route path="/register" component={Register} exact={true} />
        <Route path="/report" component={Report} exact={true} />
        <Route path="/report/:completedTasks" component={Report} exact={true} />
        <Redirect from="/" to="/home" exact />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
