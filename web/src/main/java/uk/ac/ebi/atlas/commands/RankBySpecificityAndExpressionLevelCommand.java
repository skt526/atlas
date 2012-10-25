package uk.ac.ebi.atlas.commands;

import com.google.common.base.Function;
import com.google.common.collect.MinMaxPriorityQueue;
import com.google.common.collect.Ordering;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import org.springframework.util.CollectionUtils;
import uk.ac.ebi.atlas.commons.ObjectInputStream;
import uk.ac.ebi.atlas.geneannotation.GeneNamesProvider;
import uk.ac.ebi.atlas.model.GeneExpression;
import uk.ac.ebi.atlas.model.GeneProfilesList;
import uk.ac.ebi.atlas.model.GeneProfile;
import uk.ac.ebi.atlas.model.GeneSpecificityComparator;
import uk.ac.ebi.atlas.streams.GeneProfileInputStreamFilter;
import uk.ac.ebi.atlas.streams.GeneProfilesInputStream;
import uk.ac.ebi.atlas.web.controllers.RequestPreferences;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.IOException;
import java.util.Collections;
import java.util.Comparator;
import java.util.Queue;

@Named("rankBySpecificityAndExpressionLevel")
@Scope("prototype")
public class RankBySpecificityAndExpressionLevelCommand implements Function<String, GeneProfilesList> {

    private static final Logger logger = Logger.getLogger(RankBySpecificityAndExpressionLevelCommand.class);

    private String dataFileURL;

    private RequestPreferences requestPreferences;

    GeneProfilesInputStream.Builder geneProfileInputStreamBuilder;

    private GeneNamesProvider geneNamesProvider;

    @Inject
    public RankBySpecificityAndExpressionLevelCommand(GeneProfilesInputStream.Builder geneProfileInputStreamBuilder
            , @Value("#{configuration['magetab.test.datafile.url']}") String dataFileURL
            , GeneNamesProvider geneNamesProvider) {
        this.geneProfileInputStreamBuilder = geneProfileInputStreamBuilder;
        this.dataFileURL = dataFileURL;
        this.geneNamesProvider = geneNamesProvider;
    }

    @Override
    public GeneProfilesList apply(String experimentAccession) {

        Comparator<GeneProfile> reverseSpecificityComparator = buildReverseSpecificityComparator();

        Queue<GeneProfile> rankingQueue = buildRankingQueue(reverseSpecificityComparator);


        try (ObjectInputStream<GeneProfile> inputStream = buildGeneProfilesInputStream(experimentAccession)) {

            GeneProfile geneProfile;

            int geneCount = 0;

            while ((geneProfile = inputStream.readNext()) != null) {
                rankingQueue.add(geneProfile);
                geneCount++;
            }

            GeneProfilesList list = new GeneProfilesList(rankingQueue);

            Collections.sort(list, reverseSpecificityComparator);

            list.setTotalResultCount(geneCount);

            return list;

        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new IllegalStateException("IOException when invoking ObjectInputStream.close()");
        }

    }

    protected ObjectInputStream<GeneProfile> buildGeneProfilesInputStream(String experimentAccession) {

        ObjectInputStream<GeneProfile> geneProfileInputStream = geneProfileInputStreamBuilder.forDataFileURL(dataFileURL)
                .withExperimentAccession(experimentAccession)
                .withCutoff(requestPreferences.getCutoff()).create();

        GeneProfileInputStreamFilter geneProfileInputStreamFilter = new GeneProfileInputStreamFilter(geneProfileInputStream, requestPreferences.getGeneIDs(), requestPreferences.getOrganismParts());
        geneProfileInputStreamFilter.setGeneNamesProvider(geneNamesProvider);
        return geneProfileInputStreamFilter;

    }

    protected Ordering<GeneProfile> buildReverseSpecificityComparator() {
        boolean orderBySpecificity = CollectionUtils.isEmpty(requestPreferences.getOrganismParts());
        return Ordering.from(new GeneSpecificityComparator(orderBySpecificity)).reverse();
    }

    protected Queue<GeneProfile> buildRankingQueue(Comparator<GeneProfile> reverseSpecificityComparator) {
        return MinMaxPriorityQueue.orderedBy(reverseSpecificityComparator).maximumSize(requestPreferences.getHeatmapMatrixSize()).create();
    }

    public void setRequestPreferences(RequestPreferences requestPreferences) {
        this.requestPreferences = requestPreferences;
    }


}