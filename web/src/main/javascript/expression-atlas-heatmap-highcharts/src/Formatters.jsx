"use strict";
//*------------------------------------------------------------------*
var React = require('react');
var ReactDOMServer = require('react-dom/server')
//*------------------------------------------------------------------*

var Tooltip = React.createClass({
  propTypes: {
    config: React.PropTypes.shape({
      isDifferential: React.PropTypes.bool.isRequired
    }).isRequired,
    colour: React.PropTypes.string.isRequired,
    xLabel: React.PropTypes.string.isRequired,
    yLabel: React.PropTypes.string.isRequired,
    value:  React.PropTypes.number.isRequired,
    unit:   React.PropTypes.string,
    foldChange: React.PropTypes.string,
    pValue: React.PropTypes.string
  },  //TODO extend this prop checker.Props for this component are created dynamically so it's important. If differential, expect p-values and fold changes, etc.

  render: function(){
    return (
      <div style={{whiteSpace: "pre"}}>
        {this._div("Sample name",this.props.yLabel)}
        {this._div("Experimental condition", this.props.xLabel)}
        { this.props.config.isDifferential
          ? [<div key={""}>
              {this._tinySquare()}{this._span("Fold change",this.props.foldChange)}
            </div>,
             this._div("P-value", this.props.pValue)]
          : <div>
            {this._tinySquare()}
            {this._span("Expression level",this.props.value ? (this.props.value+" "+(this.props.unit||"") ):"Below cutoff")}
          </div>
        }
      </div>
    );
  },
  _tinySquare: function(){
    return (
      <span style={{
        border: "1px rgb(192, 192, 192) solid",
        marginRight: "2px",
        width: "6px",
        height: "6px",
        display:"inline-block",
        backgroundColor:this.props.colour
      }} />
    );
  },
  _div: function(name, value){
    return (
      <div key={name+" "+value}>
        {name+": "}
        {value.length >50? <br/> : null }
        {this._bold(value)}
      </div>
    );
  },
  _span: function(name, value){
    return (
      <span key={name+" "+value}>
        {name+": "}
        {value.length >50? <br/> : null }
        {this._bold(value)}
      </span>
    );
  },
  _bold: function(value){
    return (
      <b>{value}</b>
    );
  }
});

var YAxisLabel = React.createClass({
  propTypes: {
    config: React.PropTypes.shape({
      atlasBaseURL: React.PropTypes.string.isRequired,
      isMultiExperiment: React.PropTypes.bool.isRequired
    }).isRequired,
    labelText: React.PropTypes.string.isRequired,
    resourceId: React.PropTypes.string.isRequired
  },
  render: function(){
    return (
      <a href={this.props.config.atlasBaseURL+(this.props.config.isMultiExperiment? "/experiments/":"/genes/")+this.props.resourceId}>
        {this.props.labelText}
      </a>
    );
  }
});


var makeFormatter = function(config){
  return {
    xAxis: function Formatter(value){
      return value.label;
    },
    yAxis: function Formatter(value){
      return ReactDOMServer.renderToStaticMarkup(
        <YAxisLabel
          config={config}
          labelText={value.label}
          resourceId={value.id}
          />
      );
    },
    tooltip: function Formatter (series, point) {
      var o = {
        colour: point.color,
        xLabel: series.xAxis.categories[point.x].label,
        yLabel: series.yAxis.categories[point.y].label,
        value:  point.value,
      }
      for(var key in point.options.info){
        if(point.options.info.hasOwnProperty(key)){
          o[key] = point.options.info[key];
        }
      }
      return ReactDOMServer.renderToStaticMarkup(
        <Tooltip {...o} config={config}/>
      );
    }
  }
}
//*------------------------------------------------------------------*

module.exports = makeFormatter;