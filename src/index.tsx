import React from 'react';
import ReactDOM from 'react-dom';
import Root from './pages/Root';
import reportWebVitals from './reportWebVitals';
import store from './redux/store';
import './i18n';
import './theme/main.scss';

ReactDOM.render(
    <React.Fragment>
        <Root store={store} />
    </React.Fragment>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
