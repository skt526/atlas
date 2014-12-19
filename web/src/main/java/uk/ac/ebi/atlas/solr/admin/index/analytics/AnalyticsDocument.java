package uk.ac.ebi.atlas.solr.admin.index.analytics;

import org.apache.solr.client.solrj.beans.Field;
import uk.ac.ebi.atlas.model.ExperimentType;

import static com.google.common.base.Preconditions.checkNotNull;


public class AnalyticsDocument {

    @Field("bioentity_identifier")
    private String bioentityIdentifier;

    @Field
    private String species;

    @Field
    private String experimentAccession;

    private ExperimentType experimentType;

    @Field("experimentType")
    private String experimentTypeAsString;

    @Field
    private String defaultQueryFactorType;

    @Field
    private String identifierSearch;

    @Field
    private String conditionsSearch;

    @Field
    private String assayGroupId;

    @Field
    private Double expressionLevel;

    @Field
    private String contrastId;

    @Field
    private String contrastType;

    @Field
    private Integer numReplicates;

    @Field
    private Double foldChange;

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private final AnalyticsDocument build;

        public Builder() {
            build = new AnalyticsDocument();
        }

        public AnalyticsDocument build() {
            checkNotNull(build.bioentityIdentifier, "missing bioentityIdentifier");
            checkNotNull(build.species, "missing species");
            checkNotNull(build.experimentAccession, "missing experimentAccession");
            checkNotNull(build.experimentType, "missing experimentType");
            checkNotNull(build.defaultQueryFactorType, "missing defaultQueryFactorType");
            checkNotNull(build.identifierSearch, "missing identifierSearch");
            checkNotNull(build.conditionsSearch, "missing conditionsSearch");

            if (build.experimentType.isBaseline()) {
                checkNotNull(build.assayGroupId, "missing assayGroupId for baseline experiment");
                checkNotNull(build.expressionLevel, "missing expression level for baseline experiment");
            } else if (build.experimentType.isDifferential()) {
                checkNotNull(build.contrastId, "missing contrastId for differential experiment");
                checkNotNull(build.contrastType, "missing contrastType for differential experiment");
                checkNotNull(build.numReplicates, "missing numReplicates for differential experiment");
                checkNotNull(build.foldChange, "missing foldChange for differential experiment");
            }

            build.experimentTypeAsString = build.experimentType.getDescription();
            return build;
        }

        public Builder bioentityIdentifier(String bioentityIdentifier) {
            build.bioentityIdentifier = bioentityIdentifier;
            return this;
        }

        public Builder species(String species) {
            build.species = species;
            return this;
        }

        public Builder experimentAccession(String experimentAccession) {
            build.experimentAccession = experimentAccession;
            return this;
        }

        public Builder experimentType(ExperimentType experimentType) {
            build.experimentType = experimentType;
            return this;
        }

        public Builder defaultQueryFactorType(String defaultQueryFactorType) {
            build.defaultQueryFactorType = defaultQueryFactorType;
            return this;
        }

        public Builder identifierSearch(String identifierSearch) {
            build.identifierSearch = identifierSearch;
            return this;
        }

        public Builder conditionsSearch(String conditionsSearch) {
            build.conditionsSearch = conditionsSearch;
            return this;
        }

        public Builder assayGroupId(String assayGroupId) {
            build.assayGroupId = assayGroupId;
            return this;
        }

        public Builder expressionLevel(double expressionLevel) {
            build.expressionLevel = expressionLevel;
            return this;
        }

        public Builder contrastId(String contrastId) {
            build.contrastId = contrastId;
            return this;
        }

        public Builder contrastType(String contrastType) {
            build.contrastType = contrastType;
            return this;
        }

        public Builder numReplicates(int numReplicates) {
            build.numReplicates = numReplicates;
            return this;
        }

        public Builder foldChange(double foldChange) {
            build.foldChange = foldChange;
            return this;
        }
    }

}
