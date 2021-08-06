import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App';
import reportWebVitals from './reportWebVitals';
import './fonts/Whitney/whitney.css'
import { BrowserRouter, Switch, Route, Redirect} from 'react-router-dom'
import SpotifyCallback from './components/SpotifyCallback'
import DiscordLogin from './components/DiscordCallback'
import NotFoundPage from './404'


ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route exact path="/spotifycallback">
                    <SpotifyCallback />
                </Route>
                <Route exact path="/discordlogin">
                    <DiscordLogin />
                </Route>
                <Route path='/app' component={App} >
                </Route>
                <Route exact path='/404'>
                    <NotFoundPage />
                </Route>
                <Route exact path={['/']}>
                    <Redirect to='/app' />
                </Route>
                <Route>
                    <Redirect to='/404' />
                </Route>

            </Switch>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(sendToGoogleAnalytics);

function sendToGoogleAnalytics({name, delta, value, id}) {
    // Assumes the global `gtag()` function exists, see:
    // https://developers.google.com/analytics/devguides/collection/ga4
    window.gtag('event', name, {
      // Built-in params:
      value: delta, // Use `delta` so the value can be summed.
      // Custom params:
      metric_id: id, // Needed to aggregate events.
      metric_value: value, // Optional.
      metric_delta: delta, // Optional.
  
      // OPTIONAL: any additional params or debug info here.
      // See: https://web.dev/debug-web-vitals-in-the-field/
      // metric_rating: 'good' | 'ni' | 'poor',
      // debug_info: '...',
      // ...
    });
  }
  