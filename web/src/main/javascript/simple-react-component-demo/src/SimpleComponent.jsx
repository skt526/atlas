"use strict";

//*------------------------------------------------------------------*

var React = require('react');

//*------------------------------------------------------------------*

var SimpleComponent = React.createClass({

    render: function () {
        var message = "Hello world, I’m sooooo hot!";
        return (
            <p>{message}</p>
        );
    }

});

//*------------------------------------------------------------------*

module.exports = SimpleComponent;