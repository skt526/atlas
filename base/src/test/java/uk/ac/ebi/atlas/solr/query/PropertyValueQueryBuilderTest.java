
package uk.ac.ebi.atlas.solr.query;

import com.google.common.collect.Sets;
import org.apache.solr.client.solrj.SolrQuery;
import org.junit.Before;
import org.junit.Test;
import uk.ac.ebi.atlas.model.baseline.BioentityPropertyName;
import uk.ac.ebi.atlas.solr.BioentityType;
import uk.ac.ebi.atlas.solr.query.builders.FacetedPropertyValueQueryBuilder;
import uk.ac.ebi.atlas.solr.query.builders.SolrQueryBuilder;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class PropertyValueQueryBuilderTest {

    private FacetedPropertyValueQueryBuilder subject;

    @Before
    public void setUp() throws Exception {
        subject = new FacetedPropertyValueQueryBuilder();
    }

    @Test
    public void testBuildAutocompleteSuggestionQuery() throws Exception {
        // given
        SolrQuery solrQuery = subject.withSpecies("species").withBioentityTypes(Sets.newHashSet("ensgene"))
                .withPropertyNames(BioentityPropertyName.HGNC_SYMBOL, BioentityPropertyName.MGI_ID).buildPropertyValueAutocompleteQuery("geneX");

        // then
        assertThat(solrQuery.getQuery(), is(SolrQueryService.PROPERTY_EDGENGRAM_FIELD + ":\"geneX\" AND " +
                SolrQueryBuilder.SPECIES_FIELD + ":\"species\" AND (" +
                SolrQueryService.BIOENTITY_TYPE_FIELD + ":\"ensgene\") AND (" +
                SolrQueryService.PROPERTY_NAME_FIELD + ":\"" + BioentityPropertyName.HGNC_SYMBOL.name + "\" OR " +
                SolrQueryService.PROPERTY_NAME_FIELD + ":\"" + BioentityPropertyName.MGI_ID.name + "\")"));
    }

    @Test
    public void testBuildBioentityQuery() throws Exception {
        // given
        SolrQuery solrQuery = subject.withPropertyNames(BioentityPropertyName.HGNC_SYMBOL, BioentityPropertyName.MGI_ID).buildBioentityQuery("ENSMUS000000");

        // then
        assertThat(solrQuery.getQuery(), is(SolrQueryService.BIOENTITY_IDENTIFIER_FIELD + ":\"ENSMUS000000\" AND (" +
                SolrQueryService.PROPERTY_NAME_FIELD + ":\"" + BioentityPropertyName.HGNC_SYMBOL.name + "\" OR " +
                SolrQueryService.PROPERTY_NAME_FIELD + ":\"" + BioentityPropertyName.MGI_ID.name + "\")"));

    }



}