package uk.ac.ebi.atlas.model;

import com.google.common.collect.SortedSetMultimap;
import com.google.common.collect.TreeMultimap;
import org.apache.commons.collections.CollectionUtils;
import org.springframework.context.annotation.Scope;

import javax.inject.Named;
import java.util.*;

import static com.google.common.base.Preconditions.checkState;

@Named
@Scope("prototype")
public class ExperimentalFactorsBuilder {

    private Collection<ExperimentRun> experimentRuns;

    private SortedSetMultimap<String, Factor> factorsByName = TreeMultimap.create();

    private Map<String, String> factorNamesByType = new HashMap<>();

    private Collection<FactorGroup> factorGroups = new HashSet<>();

    private SortedSetMultimap<Factor, Factor> coOccurringFactors = TreeMultimap.create();

    public ExperimentalFactorsBuilder withExperimentRuns(Collection<ExperimentRun> experimentRuns) {

        this.experimentRuns = experimentRuns;
        return this;
    }

    public ExperimentalFactors create() {
        checkState(CollectionUtils.isNotEmpty(experimentRuns), "Please provide a non empty set of ExperimentRun objects");
        Collection<FactorGroup> factorGroups = extractFactorGroups();

        for (FactorGroup factorGroup : factorGroups) {
            addFactorGroup(factorGroup);
        }

        ExperimentalFactors experimentalFactors = new ExperimentalFactors(factorsByName, factorNamesByType, factorGroups, coOccurringFactors);

        return experimentalFactors;
    }

    Collection<FactorGroup> extractFactorGroups() {
        Collection<FactorGroup> factorGroups = new ArrayList();
        for (ExperimentRun experimentRun : experimentRuns) {
            factorGroups.add(experimentRun.getFactorGroup());
        }
        return factorGroups;
    }

    void addFactorGroup(FactorGroup factorGroup) {
        factorGroups.add(factorGroup);

        for (Factor factor : factorGroup) {

            factorsByName.put(factor.getName(), factor);
            factorNamesByType.put(factor.getType(), factor.getName());

            addToFactorCombinations(factorGroup, factor);
        }
    }

    void addToFactorCombinations(FactorGroup factorGroup, Factor factor) {
        for (Factor value : factorGroup) {
            if (!value.equals(factor)) {
                coOccurringFactors.put(factor, value);
            }
        }
    }

    SortedSetMultimap<String, Factor> getFactorsByName() {
        return factorsByName;
    }

    Map<String, String> getFactorNamesByType() {
        return factorNamesByType;
    }

    SortedSetMultimap<Factor, Factor> getCoOccurringFactors() {
        return coOccurringFactors;
    }
}
