
package uk.ac.ebi.atlas.model.differential.microarray;


import uk.ac.ebi.atlas.model.ExperimentDesign;
import uk.ac.ebi.atlas.model.ExperimentType;
import uk.ac.ebi.atlas.model.Species;
import uk.ac.ebi.atlas.model.differential.Contrast;
import uk.ac.ebi.atlas.model.differential.DifferentialExperiment;

import java.util.*;

public class MicroarrayExperiment extends DifferentialExperiment {

    private SortedSet<String> arrayDesignAccessions;
    private SortedSet<String> arrayDesignNames;

    public MicroarrayExperiment(ExperimentType type, String accession, Date lastUpdate, Set<Contrast> contrasts,
                                String description, boolean hasExtraInfoFile, boolean hasRData,
                                Species species, SortedSet<String>
                                        arrayDesignAccessions,
                                SortedSet<String> arrayDesignNames, ExperimentDesign experimentDesign, Set<String> pubMedIds) {

        super(type, accession, lastUpdate, contrasts, description, hasExtraInfoFile, hasRData, species,pubMedIds, experimentDesign);
        this.arrayDesignAccessions = arrayDesignAccessions;
        this.arrayDesignNames = arrayDesignNames;
    }

    public SortedSet<String> getArrayDesignAccessions() {
        return arrayDesignAccessions;
    }

    public SortedSet<String> getArrayDesignNames() {return arrayDesignNames;}


    @Override
    public Map<String, ?> getAttributes(){
        Map<String, Object> result = new HashMap<>();
        result.putAll(super.getAttributes());
        //For showing the QC REPORTS button in the header
        result.put("qcArrayDesigns", getArrayDesignAccessions());
        result.put("allArrayDesigns",getArrayDesignNames());
        return result;

    }
}
