/** @jsx React.DOM */

/*global React */
var facetsDifferentialModule = (function ($, React) {

    var build = function build(facetsConfig, eventEmitter) {

        var Facets = React.createClass({displayName: 'Facets',
            propTypes: {

                /*
                 eg:
                 {
                 "species": [{"name": "homo sapiens", "value": "Homo sapiens"}, {"name": "arabidopsis thaliana", "value": "Arabidopsis thaliana"}],
                 "experimentType": [{"name": "rnaseq_mrna_differential", "value": "RNA-seq mRNA"}, {"name": "microarray_1colour_mrna_differential", "value": "1 colour mRNA"}],
                 "factors": [{"name": "genotype", "value": "Genotype"}],
                 "numReplicates": [{"name": "3", "value": "3"}],
                 "regulation": [{"name": "UP", "value": "Up"}]
                 }
                 */
                facets: React.PropTypes.object,

                /*
                 eg:
                 { "species" : { "homo sapiens": true }, "regulation": {"UP": true } }
                 */
                checkedFacets: React.PropTypes.object
            },

            //_setChecked: function (checked, species, factor) {
            //    this.props.setChecked(checked, species, factor);
            //},

            render: function () {
                var facets = Object.keys(this.props.facets).map(function (facet) {
                    return Facet({key: facet, facetName: facet, facetItems: this.props.facets[facet], 
                                  checkedCategories: this.props.checkedFacets && this.props.checkedFacets[facet]}
                                    //setChecked={this._setChecked}
                    );
                }.bind(this));

                return (
                    React.DOM.ul(null, 
                        facets
                    )
                );
            }
        });

        var Facet = React.createClass({displayName: 'Facet',
            propTypes: {
                facetName: React.PropTypes.string.isRequired,

                // eg: [ {"name": "rnaseq_mrna_differential", "value": "RNA-seq mRNA"}, {"name": "microarray_1colour_mrna_differential", "value": "1 colour mRNA"} ]
                facetItems: React.PropTypes.arrayOf(React.PropTypes.shape({
                    name: React.PropTypes.string.isRequired,
                    value: React.PropTypes.string.isRequired
                })).isRequired,

                // eg: { "rnaseq_mrna_differential": true, "microarray_1colour_mrna_differential": true }
                checkedCategories: React.PropTypes.object
            },

            //_setChecked: function (checked, factor) {
            //    this.props.setChecked(checked, this.props.species, factor);
            //},

            render: function () {
                var facetItems = this.props.facetItems.map(function (facetItem) {
                    return FacetItem({key: facetItem.name, name: facetItem.name, value: facetItem.value, 
                        checked: this.props.checkedCategories && this.props.checkedCategories[facetItem.name]}
                        //setChecked={this._setChecked}
                    );

                }.bind(this));

                return (
                    React.DOM.li({className: "facet"}, 
                        React.DOM.span(null, this.props.facetName), 
                        React.DOM.ul({className: "facetItems"}, 
                            facetItems
                        )
                    )
                );
            }
        });

        var FacetItem = React.createClass({displayName: 'FacetItem',

            //_setChecked: function () {
            //    this.props.setChecked(!this.props.checked, this.props.name);
            //},

            render: function () {
                return (
                    React.DOM.li(null, React.DOM.input({type: "checkbox", checked: this.props.checked ? true : false}
                            //onChange={this._setChecked}
                    ), this.props.value)
                );
            }
        });

        return {
            Facets: Facets
        };

    };

    return {
        build: function (facetsConfig) {
            return build(facetsConfig, new EventEmitter());
        }
    };

})(jQuery, React, EventEmitter);