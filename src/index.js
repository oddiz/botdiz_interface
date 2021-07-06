import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App';
import reportWebVitals from './reportWebVitals';
import './fonts/whitney.css'
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import SpotfiyCallback from './components/SpotifyCallback'
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Switch>
                    <Route path="/spotifycallback">
                        <SpotfiyCallback />
                    </Route>
                    <App />
            </Switch>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
