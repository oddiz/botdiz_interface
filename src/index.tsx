import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App';
import reportWebVitals from './reportWebVitals';
import './fonts/Whitney/whitney.css'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import SpotifyCallback from './components/SpotifyCallback'
import { DiscordCallback } from './components/DiscordCallback'
import NotFoundPage from './404'
import { RecoilRoot } from 'recoil'


declare global {
    interface Window {
        gtag: any
    }
}

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <BrowserRouter>
                <Routes>
                    <Route path='/app' element={<App />} />
                    <Route path="/spotifycallback" element= {<SpotifyCallback />} />
                    <Route path="/discordlogin" element={<DiscordCallback />} />
                    <Route path='/404' element={<NotFoundPage />} />
                    <Route path='/' element={
                        <Navigate replace to='/app' />
                    } />
                    <Route
                        path="*"
                        element={
                            <Navigate replace to='/404' />
                        }
                    />

                </Routes>
                
                
            </BrowserRouter>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(sendToGoogleAnalytics);

//@ts-ignore
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
  