import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ImageComponent from './components/Image';

class CrossStitch extends React.Component {
    render() {
        return (
            <ImageComponent />
        );
    }
}

ReactDOM.render(
    <CrossStitch />,
    document.getElementById('root')
);