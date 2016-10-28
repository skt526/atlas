package uk.ac.ebi.atlas.profiles;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import uk.ac.ebi.atlas.commons.streams.ObjectInputStream;
import uk.ac.ebi.atlas.model.Expression;
import uk.ac.ebi.atlas.model.GeneProfilesList;
import uk.ac.ebi.atlas.model.Profile;
import uk.ac.ebi.atlas.profiles.differential.ProfileStreamOptions;
import uk.ac.ebi.atlas.solr.query.GeneQueryResponse;

import java.io.IOException;

public class ProfilesHeatMapSource<P extends Profile<T, ? extends Expression>, L extends GeneProfilesList<P>, O extends
        ProfileStreamOptions<T>, T> {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfilesHeatMapSource.class);

    private ProfileStreamFactory<O, P, T> profileStreamFactory;
    private ProfileStreamPipelineBuilder<P, O, T> profileStreamPipelineBuilder;

    public ProfilesHeatMapSource(ProfileStreamFactory<O, P, T>
                                         profileStreamFactory, ProfileStreamFilters<P, T> profileStreamFilters) {
        this.profileStreamFactory = profileStreamFactory;
        this.profileStreamPipelineBuilder = new ProfileStreamPipelineBuilder<>(profileStreamFilters);
    }

    public L fetch(O options,SelectProfiles<P, L> selectProfiles, GeneQueryResponse geneQueryResponse, boolean
            shouldAverageIntoGeneSets)  {
        int maxSize = options.getHeatmapMatrixSize();

        try (ObjectInputStream<P> source = profileStreamFactory.create(options)) {

            Iterable<P> profiles = new IterableObjectInputStream<>(source);

            Iterable<P> profilesPipeline = profileStreamPipelineBuilder.build(profiles, options,
                    geneQueryResponse, shouldAverageIntoGeneSets);

            return selectProfiles.select(profilesPipeline, maxSize);

        } catch (IOException e) {
            LOGGER.error(e.getMessage(), e);
            throw new IllegalStateException(e);
        }
    }

}