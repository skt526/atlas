package uk.ac.ebi.atlas.search;

import com.google.common.base.Optional;
import com.google.common.collect.ImmutableSet;
import org.apache.solr.client.solrj.response.QueryResponse;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.search.analyticsindex.solr.AnalyticsClient;
import uk.ac.ebi.atlas.search.analyticsindex.solr.AnalyticsQueryBuilder;
import uk.ac.ebi.atlas.solr.SolrUtil;
import uk.ac.ebi.atlas.web.SemanticQuery;

import javax.inject.Inject;
import javax.inject.Named;

/**
 * Created by Alfonso Muñoz-Pomer Fuentes <amunoz@ebi.ac.uk> on 22/02/2016.
 */
@Named
@Scope("singleton")
public class AnalyticsSearchService {

    private AnalyticsClient analyticsClient;
    private AnalyticsQueryBuilder analyticsQueryBuilder;


    @Inject
    public AnalyticsSearchService(AnalyticsClient analyticsClient, AnalyticsQueryBuilder analyticsQueryBuilder) {
        this.analyticsClient = analyticsClient;
        this.analyticsQueryBuilder = analyticsQueryBuilder;
    }

    public Optional<ImmutableSet<String>> searchBioentityIdentifiers(SemanticQuery geneQuery, String species) {
        QueryResponse queryResponse = analyticsClient.query(analyticsQueryBuilder.queryIdentifierSearch(geneQuery).ofSpecies(species).setRows(0).facetByBioentityIdentifier().build());
        return Optional.of(SolrUtil.extractFirstFacetValues(queryResponse));
    }
}
