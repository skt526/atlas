package uk.ac.ebi.atlas.experimentpage.baseline.download;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableMap;
import uk.ac.ebi.atlas.experimentpage.baseline.coexpression.CoexpressedGenesService;
import uk.ac.ebi.atlas.experimentpage.context.BaselineRequestContext;
import uk.ac.ebi.atlas.model.download.ExternallyAvailableContent;
import uk.ac.ebi.atlas.model.experiment.baseline.BaselineExperiment;
import uk.ac.ebi.atlas.profiles.baseline.BaselineProfileStreamFactory;
import uk.ac.ebi.atlas.profiles.baseline.BaselineProfileStreamTransforms;
import uk.ac.ebi.atlas.profiles.writer.BaselineProfilesWriterFactory;
import uk.ac.ebi.atlas.search.SearchDescription;
import uk.ac.ebi.atlas.search.SemanticQuery;
import uk.ac.ebi.atlas.solr.query.GeneQueryResponse;
import uk.ac.ebi.atlas.solr.query.SolrQueryService;
import uk.ac.ebi.atlas.web.BaselineRequestPreferences;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;

import static org.apache.commons.lang3.StringUtils.wrap;

public class BaselineProfilesWriterService extends ExternallyAvailableContent.Supplier<BaselineExperiment>{


    private BaselineProfileStreamFactory inputStreamFactory;

    private BaselineProfilesWriterFactory baselineProfilesWriterFactory;

    private SolrQueryService solrQueryService;

    private CoexpressedGenesService coexpressedGenesService;

    public BaselineProfilesWriterService(BaselineProfileStreamFactory inputStreamFactory,
                                         BaselineProfilesWriterFactory baselineProfilesWriterFactory,
                                         SolrQueryService solrQueryService,
                                         CoexpressedGenesService coexpressedGenesService) {
        this.inputStreamFactory = inputStreamFactory;
        this.baselineProfilesWriterFactory = baselineProfilesWriterFactory;
        this.solrQueryService = solrQueryService;
        this.coexpressedGenesService = coexpressedGenesService;

    }

    public long write(Writer writer, BaselineRequestPreferences preferences, BaselineExperiment experiment,
                      Map<String, Integer> coexpressionsRequested) {
        int totalCoexpressionsRequested = 0;
        for (Map.Entry<String, Integer> e : coexpressionsRequested.entrySet()) {
            totalCoexpressionsRequested += e.getValue();
        }

        final BaselineRequestContext requestContext = new BaselineRequestContext(preferences, experiment);
        GeneQueryResponse geneQueryResponse =
                solrQueryService.fetchResponse(requestContext.getGeneQuery(), requestContext.getSpecies().getReferenceName());
        if(totalCoexpressionsRequested>0){
            geneQueryResponse =
                    coexpressedGenesService.extendGeneQueryResponseWithCoexpressions(
                            experiment, geneQueryResponse, coexpressionsRequested);
        }
        final boolean asGeneSets = false;

        return inputStreamFactory.write(experiment, requestContext,
                new BaselineProfileStreamTransforms(requestContext, geneQueryResponse, asGeneSets),
                baselineProfilesWriterFactory.create(writer, requestContext,
                        describe(requestContext.getGeneQuery(), totalCoexpressionsRequested),
                        asGeneSets));
    }


    private String describe(SemanticQuery geneQuery, int coexpressedGenes) {
        return coexpressedGenes == 0 ? wrap(SearchDescription.get(geneQuery), "'") :
                geneQuery.description() + " with "+ coexpressedGenes + " similarly expressed genes";
    }

    @Override
    public Collection<ExternallyAvailableContent> get(final BaselineExperiment experiment) {
        final BaselineRequestPreferences preferences = new BaselineRequestPreferences();
        preferences.setCutoff(0.0d);
        preferences.setGeneQuery(SemanticQuery.create());
        final Map<String, Integer> coexpressionsRequested = ImmutableMap.of();

        return Collections.singleton(new ExternallyAvailableContent(makeUri("tsv"),
                ExternallyAvailableContent.Description.create("data", "link", "Expression values across all genes"), new Function<OutputStream, Void>() {
            @Override
            public Void apply(OutputStream outputStream) {
                write(new PrintWriter(outputStream), preferences, experiment, coexpressionsRequested);
                return null;
            }
        }));

    }
}
