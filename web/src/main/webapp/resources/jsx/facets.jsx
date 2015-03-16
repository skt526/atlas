/** @jsx React.DOM */

/*global React */
var facetsModule = (function (React) {

    var build = function () {

        var Facets = React.createClass({
            propTypes: {

                /*
                 Differential eg:
                 {
                 "species": [ {"name": "homo sapiens", "value": "Homo sapiens"}, {"name": "arabidopsis thaliana", "value": "Arabidopsis thaliana"} ],
                 "experimentType": [ {"name": "rnaseq_mrna_differential", "value": "RNA-seq mRNA"}, {"name": "microarray_1colour_mrna_differential", "value": "1 colour mRNA"} ],
                 "factors": [ {"name": "genotype", "value": "Genotype"} ],
                 "numReplicates": [ {"name": "3", "value": "3"} ],
                 "regulation": [ {"name": "UP", "value": "Up"} ]
                 }

                 Baseline eg:
                 {
                 "homo sapiens" : [ {"factor": "CELL_LINE", "source": "Cell line"}, {"factor": "ORGANISM_PART", "source": "Tissue"} ],
                 "mus musculus" : [ {"factor": "CELL_LINE", "source": "Cell line"}, {"factor": "INDIVIDUAL", "source": "Individual"} ]
                 }
                 */
                facets: React.PropTypes.object,

                /*
                 Differential eg:
                 { "species" : { "homo sapiens": true, "arabidopsis thaliana": true }, "regulation": {"UP": true } }

                 Baseline eg:
                 eg:
                 { "homo sapiens" : { "CELL_LINE": true, "ORGANISM_PART": true } }
                 */
                checkedFacets: React.PropTypes.object
            },

            _setChecked: function (checked, facet, facetItem) {
                this.props.setChecked(checked, facet, facetItem);
            },

            render: function () {
                var facets = Object.keys(this.props.facets).map(function (facet) {
                    return <Facet key={facet} facetName={facet} facetItems={this.props.facets[facet]}
                                  checkedFacetItems={this.props.checkedFacets && this.props.checkedFacets[facet]}
                                  setChecked={this._setChecked}
                    />;
                }.bind(this));

                return (
                    <ul>
                        {facets}
                    </ul>
                );
            }
        });

        var Facet = React.createClass({
            propTypes: {
                facetName: React.PropTypes.string.isRequired,

                // eg: [ {"name": "rnaseq_mrna_differential", "value": "RNA-seq mRNA"}, {"name": "microarray_1colour_mrna_differential", "value": "1 colour mRNA"} ]
                facetItems: React.PropTypes.arrayOf(React.PropTypes.shape({
                    name: React.PropTypes.string.isRequired,
                    value: React.PropTypes.string.isRequired
                })).isRequired,

                // eg: { "rnaseq_mrna_differential": true, "microarray_1colour_mrna_differential": true }
                checkedFacetItems: React.PropTypes.object
            },

            _setChecked: function (checked, facetItem) {
                this.props.setChecked(checked, this.props.facetName, facetItem);
            },

            render: function () {
                var facetItems = this.props.facetItems.map(function (facetItem) {
                    return <FacetItem key={facetItem.name} name={facetItem.name} value={facetItem.value}
                        checked={this.props.checkedFacetItems && this.props.checkedFacetItems[facetItem.name]}
                        setChecked={this._setChecked}
                    />;

                }.bind(this));

                return (
                    <li className="facet">
                        <span>{this.props.facetName}</span>
                        <ul className="facetItems">
                            {facetItems}
                        </ul>
                    </li>
                );
            }
        });

        var FacetItem = React.createClass({
            propTypes: {
                name: React.PropTypes.string.isRequired,
                value: React.PropTypes.string.isRequired,
                checked: React.PropTypes.bool.isRequired
            },

            _setChecked: function () {
                this.props.setChecked(!this.props.checked, this.props.name);
            },

            render: function () {
                return (
                    <li><input type="checkbox" checked={this.props.checked ? true : false}
                               onChange={this._setChecked}
                    />{this.props.value}</li>
                );
            }
        });

        return {
            Facets: Facets
        };
    };

    return {
        build: build
    };

})(React);