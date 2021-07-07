import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App';
import reportWebVitals from './reportWebVitals';
import './fonts/whitney.css'
import { BrowserRouter, Switch, Route, Redirect} from 'react-router-dom'
import SpotfiyCallback from './components/SpotifyCallback'
import NotFoundPage from './404'
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                <Route exact path='/'>
                    <Redirect to='/app' />
                </Route>
                <Route exact path="/spotifycallback">
                    <SpotfiyCallback />
                </Route>
                <Route path='/app'>
                    
                    <App />
                </Route>
                <Route path='/404' component={NotFoundPage} />
                <Route >
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
reportWebVitals();
