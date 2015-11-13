package uk.ac.ebi.atlas.search.analyticsindex.differential;

import org.springframework.core.io.Resource;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;
import uk.ac.ebi.atlas.web.GeneQuery;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.MessageFormat;

import static uk.ac.ebi.atlas.utils.ResourceUtils.readPlainTextResource;

/**
 * Created by Alfonso Muñoz-Pomer Fuentes <amunoz@ebi.ac.uk> on 12/11/2015.
 */
public abstract class DifferentialAnalyticsDAO {

    protected static final String FQ_TEMPLATE = "&fq=foldChange:([* TO {0}] OR [{1} TO *])";
    protected static final String QUERY_TEMPLATE = "query?q={0}&rows=1000&omitHeader=true";
    protected static final String DIFFERENTIAL_ONLY = "experimentType:(rnaseq_mrna_differential OR microarray_1colour_mrna_differential OR microarray_2colour_mrna_differential OR microarray_1colour_microrna_differential)";
    protected static final String IDENTIFIER_SEARCH_FIELD = "identifierSearch";
    protected static final String BIOENTITY_IDENTIFIER_FIELD = "bioentityIdentifier";

    protected static final double DEFAULT_POSITIVE_FOLD_CHANGE = 1.0;
    protected static final double DEFAULT_NEGATIVE_FOLD_CHANGE = -1.0;

    protected final RestTemplate restTemplate;
    protected final String solrBaseUrl;
    protected final String differentialGeneFacetsQuery;

    public DifferentialAnalyticsDAO(RestTemplate restTemplate, String solrBaseUrl, Resource differentialFacetsQueryJSON) {
        SimpleClientHttpRequestFactory rf = (SimpleClientHttpRequestFactory) restTemplate.getRequestFactory();
        rf.setReadTimeout(60000);
        rf.setConnectTimeout(60000);

        this.restTemplate = restTemplate;
        this.solrBaseUrl = solrBaseUrl;
        this.differentialGeneFacetsQuery = "&json.facet=" + encodeQueryParam(readPlainTextResource(differentialFacetsQueryJSON).replaceAll("\\s+",""));
    }

    protected String buildSolrQuery(GeneQuery geneQuery, String searchField) {
        return geneQuery.isEmpty() ? "" : String.format("%s:(%s)", searchField, geneQuery.as1DNF());
    }

    protected String buildQueryParameters(String q, double negativeFoldChange, double positiveFoldChange) {
        return MessageFormat.format(QUERY_TEMPLATE, encodeQueryParam(q)) + encodeQuery(MessageFormat.format(FQ_TEMPLATE, negativeFoldChange, positiveFoldChange));
    }

    protected static String encodeQueryParam(String param) {
        try {
            return UriUtils.encodeQueryParam(param, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new DifferentialAnalyticsDAOException(e);
        }
    }

    protected static String encodeQuery(String s) {
        // doesn't encode =
        try {
            return UriUtils.encodeQuery(s, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new DifferentialAnalyticsDAOException(e);
        }
    }

    protected String fetchResponseAsString(String url) {
        try {
            return restTemplate.getForObject(new URI(url), String.class);
        } catch (RestClientException | URISyntaxException e) {
            throw new DifferentialAnalyticsDAOException(e);
        }
    }

    protected static class DifferentialAnalyticsDAOException extends RuntimeException {
        public DifferentialAnalyticsDAOException(Exception e) {
            super(e);
        }
    }
}
