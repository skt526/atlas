package uk.ac.ebi.atlas.experimentimport.analyticsindex;

import com.google.common.base.Throwables;
import com.google.common.collect.ImmutableList;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.SolrServerException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.IOException;
import java.util.Iterator;

@Named
public class AnalyticsIndexDAO {
    private static final Logger LOGGER = LoggerFactory.getLogger(AnalyticsIndexDAO.class);

    private static final int COMMIT_TIME_IN_MILLISECONDS = 15 * 60 * 1000;  // 15 minutes

    private final SolrClient solrClient;

    @Inject
    public AnalyticsIndexDAO(@Qualifier("analyticsSolrClient") SolrClient solrClient) {
        this.solrClient = solrClient;
    }

    public int addDocuments(Iterable<AnalyticsDocument> documents, int batchSize) {
        int count = 0;

        try {
            Iterator<AnalyticsDocument> iterator = documents.iterator();

            ImmutableList.Builder<AnalyticsDocument> builder;
            int thisBatchSize;

            while (iterator.hasNext()) {
                builder = new ImmutableList.Builder<>();
                thisBatchSize = 0;
                while (iterator.hasNext() && thisBatchSize < batchSize) {
                    AnalyticsDocument document = iterator.next();
                    if (document.validate()) {
                        builder.add(document);
                        thisBatchSize++;
                    }
                }

                ImmutableList<AnalyticsDocument> documentList = builder.build();
                if (!documentList.isEmpty()) {
                    solrClient.addBeans(documentList, COMMIT_TIME_IN_MILLISECONDS);
                    count += thisBatchSize;
                }
            }
            solrClient.commit(false, false);
        } catch (IOException | SolrServerException e) {
            rollBackAndPropagateException(e);
        }

        return count;
    }

    public void deleteDocumentsForExperiment(String accession) {
        try {
            solrClient.deleteByQuery("experimentAccession:" + accession);
            solrClient.commit();
        } catch (IOException | SolrServerException e) {
            rollBackAndPropagateException(e);
        }
    }



    public void deleteAllDocuments() {
        try {
            solrClient.deleteByQuery("*:*");
            solrClient.commit();
            solrClient.optimize();
        } catch (IOException | SolrServerException e) {
            rollBackAndPropagateException(e);
        }
    }

    public void optimize() {
        try {
            solrClient.optimize();
        } catch (IOException | SolrServerException e) {
            rollBackAndPropagateException(e);
        }
    }

    private void rollBackAndPropagateException(Exception exception) {
        try {
            LOGGER.error(exception.getMessage(), exception);
            solrClient.rollback();
            Throwables.propagate(exception);
        } catch (IOException | SolrServerException e) {
            LOGGER.error(e.getMessage());
        }
    }
}