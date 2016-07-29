
package uk.ac.ebi.atlas.web.controllers.page;

import com.google.common.collect.SortedSetMultimap;
import com.google.common.collect.TreeMultimap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import uk.ac.ebi.atlas.model.Experiment;
import uk.ac.ebi.atlas.model.ExperimentType;
import uk.ac.ebi.atlas.model.baseline.BaselineExperiment;
import uk.ac.ebi.atlas.model.differential.DifferentialExperiment;
import uk.ac.ebi.atlas.trader.ExperimentTrader;
import uk.ac.ebi.atlas.trader.SpeciesKingdomTrader;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.*;


@Controller
// if we make it singleton it gets initialized during deployment, that means deployment becomes slow
@Scope("request")
public class PlantExperimentsController {
    private static final Logger LOGGER = LoggerFactory.getLogger(PlantExperimentsController.class);

    private ExperimentTrader experimentTrader;
    private SpeciesKingdomTrader speciesKingdomTrader;

    private Integer numberOfPlantExperiments;

    private SortedSetMultimap<String, String> baselineExperimentAccessionsBySpecies;
    private SortedMap<String, Integer> numDifferentialExperimentsBySpecies;

    private Map<String, String> experimentLinks = new HashMap<>();
    private Map<String, String> experimentDisplayNames = new HashMap<>();

    @Inject
    public PlantExperimentsController(ExperimentTrader experimentTrader, SpeciesKingdomTrader speciesKingdomTrader) {
        this.experimentTrader = experimentTrader;
        this.speciesKingdomTrader = speciesKingdomTrader;
    }

    @RequestMapping("/plant/experiments")
    public String getBaselineExperimentsPage(Model model) {

        loadExperimentAccessionsBySpecies();

        model.addAttribute("baselineExperimentAccessionsBySpecies", baselineExperimentAccessionsBySpecies);
        model.addAttribute("numDifferentialExperimentsBySpecies", numDifferentialExperimentsBySpecies);
        model.addAttribute("experimentLinks", experimentLinks);
        model.addAttribute("experimentDisplayNames", experimentDisplayNames);
        model.addAttribute("numberOfPlantExperiments", numberOfPlantExperiments);

        model.addAttribute("mainTitle", "Plant experiments ");

        return "plant-experiments";
    }

    @PostConstruct
    private void loadExperimentAccessionsBySpecies() {

        // Get number of all public plant experiments in Atlas
        numberOfPlantExperiments = 0;

        Comparator<String> keyComparator = new Comparator<String>() {
            @Override
            public int compare(String o1, String o2) {
                return o1.compareTo(o2);
            }
        };
        // experiments should be sorted by their display name, not accession
        Comparator<String> valueComparator = new Comparator<String>() {
            @Override
            public int compare(String o1, String o2) {
                return experimentDisplayNames.get(o1).compareTo(experimentDisplayNames.get(o2));
            }
        };
        baselineExperimentAccessionsBySpecies = TreeMultimap.create(keyComparator, valueComparator);

        for (String experimentAccession : experimentTrader.getAllBaselineExperimentAccessions()) {
            try {
                int numberOfAssays = 0;
                Experiment experiment = experimentTrader.getPublicExperiment(experimentAccession);
                if (experiment.getType() == ExperimentType.RNASEQ_MRNA_BASELINE || experiment.getType() == ExperimentType.PROTEOMICS_BASELINE) {
                    numberOfAssays = ((BaselineExperiment) experiment).getExperimentRunAccessions().size();
                }
                else if (experiment.getType() == ExperimentType.MICROARRAY_ANY || experiment.getType() == ExperimentType.RNASEQ_MRNA_DIFFERENTIAL) {
                    numberOfAssays = ((DifferentialExperiment) experiment).getAssayAccessions().size();
                }

                String displayName = experimentTrader.getPublicExperiment(experimentAccession).getDisplayName();
                experimentDisplayNames.put(experimentAccession, displayName + " (" + numberOfAssays + " assays)");

                String species = experiment.getSpeciesString();
                if (speciesKingdomTrader.getKingdom(species).equals("plants")) {
                    baselineExperimentAccessionsBySpecies.put(species, experimentAccession);
                    experimentLinks.put(experimentAccession + species, "");
                    numberOfPlantExperiments++;
                }

            } catch (RuntimeException e) {
                // we don't want the entire application to crash just because one condensedSdrf file may be offline because a curator is modifying it
                LOGGER.error(e.getMessage(), e);
            }
        }

        numDifferentialExperimentsBySpecies = new TreeMap<>();
        long start = System.currentTimeMillis();
        populateExperimentAccessionToSpecies(ExperimentType.MICROARRAY_1COLOUR_MRNA_DIFFERENTIAL);
        populateExperimentAccessionToSpecies(ExperimentType.MICROARRAY_2COLOUR_MRNA_DIFFERENTIAL);
        populateExperimentAccessionToSpecies(ExperimentType.MICROARRAY_1COLOUR_MICRORNA_DIFFERENTIAL);
        populateExperimentAccessionToSpecies(ExperimentType.RNASEQ_MRNA_DIFFERENTIAL);
        LOGGER.info("Differential experiments took: {} ms", System.currentTimeMillis() - start);
    }


    /**
     * Populates numDifferentialExperimentsBySpecies and numberOfPlantExperiments for a given experimentType
     * This is a part of a work-around until https://www.pivotaltracker.com/story/show/88885788 gets implemented.
     */
    private void populateExperimentAccessionToSpecies(ExperimentType experimentType) {
        for (String experimentAccession : experimentTrader.getPublicExperimentAccessions(experimentType)) {
            try {
                DifferentialExperiment experiment = (DifferentialExperiment) experimentTrader.getExperimentFromCache(experimentAccession, experimentType);
                String species = experiment.getSpeciesString();

                if (speciesKingdomTrader.getKingdom(species) == null) {
                    LOGGER.warn(species + " has no kingdom (maybe it is missing in BIOENTITY_ORGANISM ot it has been mis-spelled)");
                    continue;
                }

                if (speciesKingdomTrader.getKingdom(species).equals("plants")) {
                    Integer numSoFar = numDifferentialExperimentsBySpecies.get(species);
                    if (numDifferentialExperimentsBySpecies.get(species) == null) {
                        numDifferentialExperimentsBySpecies.put(species, 1);
                    } else {
                        numDifferentialExperimentsBySpecies.put(species, ++numSoFar);
                    }
                    numberOfPlantExperiments++;
                }

            } catch (RuntimeException e) {
                // we don't want the entire application to crash just because one condensedSdrf file may be offline because a curator is modifying it
                LOGGER.error(e.getMessage(), e);
            }
        }
    }
}