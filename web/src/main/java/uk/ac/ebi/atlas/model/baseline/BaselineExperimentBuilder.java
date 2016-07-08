
package uk.ac.ebi.atlas.model.baseline;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.model.AssayGroups;
import uk.ac.ebi.atlas.model.ExperimentDesign;
import uk.ac.ebi.atlas.model.ExperimentType;

import javax.inject.Named;
import java.util.*;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

@Named
@Scope("prototype")
public class BaselineExperimentBuilder {

    private String species;
    private String kingdom;
    private String ensemblDB;
    private String description;
    private List<String> dataProviderURL;
    private List<String> dataProviderDescription;
    private String displayName;
    private boolean hasExtraInfoFile;
    private boolean hasRData;
    private Map<String, String> speciesMapping;
    private String experimentAccession;
    private Set<String> pubMedIds;
    private ExperimentDesign experimentDesign;
    private Date lastUpdate;
    private AssayGroups assayGroups;
    private ExperimentalFactors experimentalFactors;
    private ExperimentType experimentType;
    private List<String> alternativeViews = Collections.emptyList();

    public BaselineExperimentBuilder forSpecies(String species) {
        this.species = species;
        return this;
    }

    public BaselineExperimentBuilder ofKingdom(String kingdom) {
        this.kingdom = kingdom;
        return this;
    }

    public BaselineExperimentBuilder ofEnsemblDB(String ensemblDB) {
        this.ensemblDB = ensemblDB;
        return this;
    }

    public BaselineExperimentBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    public BaselineExperimentBuilder withRData(boolean hasRData) {
        this.hasRData = hasRData;
        return this;
    }

    public BaselineExperimentBuilder withDataProviderURL(List<String> dataProviderURL) {
        this.dataProviderURL = dataProviderURL;
        return this;
    }

    public BaselineExperimentBuilder withDataProviderDescription(List<String> dataProviderDescription) {
        this.dataProviderDescription = dataProviderDescription;
        return this;
    }

    public BaselineExperimentBuilder withExtraInfo(boolean hasExtraInfoFile) {
        this.hasExtraInfoFile = hasExtraInfoFile;
        return this;
    }

    public BaselineExperimentBuilder withExperimentalFactors(ExperimentalFactors experimentalFactors) {
        this.experimentalFactors = experimentalFactors;
        return this;
    }

    public BaselineExperimentBuilder withDisplayName(String displayName) {
        this.displayName = displayName;
        return this;
    }

    public BaselineExperimentBuilder withSpeciesMapping(Map<String, String> speciesMapping) {
        this.speciesMapping = speciesMapping;
        return this;
    }

    public BaselineExperimentBuilder withPubMedIds(Set<String> pubMedIds) {
        this.pubMedIds = pubMedIds;
        return this;
    }

    public BaselineExperimentBuilder withExperimentDesign(ExperimentDesign experimentDesign) {
        this.experimentDesign = experimentDesign;
        return this;
    }

    public BaselineExperimentBuilder withAssayGroups(AssayGroups assayGroups) {
        this.assayGroups = assayGroups;
        return this;
    }

    public BaselineExperimentBuilder withAccession(String experimentAccession) {
        this.experimentAccession = experimentAccession;
        return this;
    }

    public BaselineExperimentBuilder withLastUpdate(Date lastUpdate) {
        this.lastUpdate = lastUpdate;
        return this;
    }

    public BaselineExperimentBuilder ofType(ExperimentType experimentType) {
        this.experimentType = experimentType;
        return this;
    }

    public BaselineExperimentBuilder withAlternativeViews(List<String> alternativeViews) {
        this.alternativeViews = alternativeViews;
        return this;
    }



    public BaselineExperiment create() {
        validate();

        return new BaselineExperiment(experimentType, experimentAccession, lastUpdate, experimentalFactors, description,
                displayName, species, kingdom, ensemblDB, speciesMapping, hasExtraInfoFile, hasRData,
                pubMedIds, experimentDesign, assayGroups, dataProviderURL, dataProviderDescription, alternativeViews);
    }

    void validate() {
        checkNotNull(experimentType);
        checkState(experimentType.isBaseline());
        checkNotNull(assayGroups, "Please provide a non empty set of AssayGroup objects");
        checkState(CollectionUtils.isNotEmpty(assayGroups.getAssayGroupIds()), "Please provide a non empty set of AssayGroup objects");
        checkState(speciesMapping != null, "Please provide a map of species mappings");
        checkState(experimentalFactors != null, "Please provide a ExperimentFactors object");
        checkState(experimentDesign != null, "Please provide a ExperimentDesign object");
        checkState(pubMedIds != null, "Please provide a pubMedIds object");

        if (StringUtils.isBlank(displayName)) {
            displayName = experimentAccession;
        }
    }

}