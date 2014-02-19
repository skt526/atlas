/*
 * Copyright 2008-2013 Microarray Informatics Team, EMBL-European Bioinformatics Institute
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * For further details of the Gene Expression Atlas project, including source code,
 * downloads and documentation, please see:
 *
 * http://gxa.github.com/gxa
 */

package uk.ac.ebi.atlas.model.baseline;

import com.google.common.collect.*;
import org.apache.commons.collections.CollectionUtils;
import uk.ac.ebi.atlas.dto.tooltip.AssayGroupFactor;

import java.io.Serializable;
import java.util.*;

import static com.google.common.base.Preconditions.checkState;

/*
 *  ExperimentalFactors has factor information per _assay group_.
 *  ExperimentalFactors is used to render the experiment page.
 *  At experiment load time it is built from a ExperimentDesign and list of assay group ids.
 *
 *  ExperimentDesign also stores factors but per _assay_. It is used to render the
 *  experiment design page.
 *
 */
public class ExperimentalFactors implements Serializable {

    private String defaultQueryFactorType;

    private Set<Factor> defaultFilterFactors;

    private SortedSetMultimap<String, Factor> factorsByType = TreeMultimap.create();

    private BiMap<String, String> factorDisplayNamesByType = HashBiMap.create();

    private SortedSetMultimap<Factor, Factor> coOccurringFactors = TreeMultimap.create();

    private Set<String> menuFilterFactorTypes;

    private List<FactorGroup> orderedFactorGroups;

    private Map<String, FactorGroup> orderedFactorGroupsByAssayGroup;

    ExperimentalFactors(SortedSetMultimap<String, Factor> factorsByType,
                        Map<String, String> factorDisplayNamesByType,
                        List<FactorGroup> orderedFactorGroups,
                        SortedSetMultimap<Factor, Factor> coOccurringFactors,
                        Set<String> menuFilterFactorTypes,
                        Map<String, FactorGroup> orderedFactorGroupsByAssayGroup,
                        String defaultQueryFactorType,
                        Set<Factor> defaultFilterFactors) {
        this.factorsByType = factorsByType;
        this.orderedFactorGroupsByAssayGroup = orderedFactorGroupsByAssayGroup;
        this.factorDisplayNamesByType.putAll(factorDisplayNamesByType);
        this.orderedFactorGroups = orderedFactorGroups;
        this.coOccurringFactors = coOccurringFactors;
        this.menuFilterFactorTypes = menuFilterFactorTypes;
        this.defaultQueryFactorType = defaultQueryFactorType;
        this.defaultFilterFactors = defaultFilterFactors;
    }

    public String getDefaultQueryFactorType() {
        return defaultQueryFactorType;
    }

    public Set<Factor> getDefaultFilterFactors() {
        return Collections.unmodifiableSet(defaultFilterFactors);
    }

    public String getFactorDisplayName(String type) {

        checkState(factorDisplayNamesByType.containsKey(type), "Cannot find a factor with the given factor type: " + type);

        return factorDisplayNamesByType.get(type);
    }

    public String getFactorType(String displayName) {

        checkState(factorDisplayNamesByType.inverse().containsKey(displayName), "Cannot find a factor with the given factor display name: " + displayName);

        return factorDisplayNamesByType.inverse().get(displayName);
    }

    //ToDo: this is only used to build factor filter menu, maybe should be encapsulated in a menu builder and the menu builder could be used by a menu cache loader
    public SortedSet<Factor> getCoOccurringFactors(Factor factor) {
        return coOccurringFactors.get(factor);
    }

    public SortedSet<Factor> getFactorsByType(String type) {

        return ImmutableSortedSet.copyOf(factorsByType.get(type));

    }

    public SortedSet<Factor> getFilteredFactors(final Set<Factor> filterFactors) {

        if (CollectionUtils.isEmpty(filterFactors)) {
            return getAllFactors();
        }

        TreeSet<Factor> filteredFactors = Sets.newTreeSet();

        for (FactorGroup factorGroup : orderedFactorGroups) {

            List<Factor> remainingFactors = factorGroup.remove(filterFactors);
            if (remainingFactors.size() == 1) {
                filteredFactors.add(remainingFactors.get(0));
            }
        }

        return filteredFactors;

    }

    public SortedSet<AssayGroupFactor> getFilteredAssayGroupFactors(final Set<Factor> filterFactors) {

        SortedSet<AssayGroupFactor> result = Sets.newTreeSet();

        for (String groupId : orderedFactorGroupsByAssayGroup.keySet()) {
            List<Factor> remainingFactors;

            if (CollectionUtils.isNotEmpty(filterFactors)) {
                remainingFactors = orderedFactorGroupsByAssayGroup.get(groupId).remove(filterFactors);
            } else {
                remainingFactors = Lists.newArrayList(orderedFactorGroupsByAssayGroup.get(groupId).iterator());
            }
            if (remainingFactors.size() == 1) {
                result.add(new AssayGroupFactor(groupId, remainingFactors.get(0)));
            }
        }

        return result;
    }

    public FactorGroup getFactorGroupByAssayGroup(String assayGroupId) {
        return orderedFactorGroupsByAssayGroup.get(assayGroupId);
    }

    public SortedSet<Factor> getFactorsForAssayGroupsByType(Collection<String> assayGroupIds, String factorType) {
        SortedSet<Factor> factors = Sets.newTreeSet();
        for (String assayGroupId : assayGroupIds) {
            FactorGroup factorGroupForAssay = getFactorGroupByAssayGroup(assayGroupId);
            Factor defaultFactorForAssay = factorGroupForAssay.getFactorByType(factorType);
            factors.add(defaultFactorForAssay);
        }
        return factors;
    }

    public SortedSet<String> getMenuFilterFactorNames() {

        SortedSet<String> factorNames = Sets.newTreeSet();

        for (String type : menuFilterFactorTypes) {

            String factorName = getFactorDisplayName(type);
            factorNames.add(factorName);
        }

        return factorNames;
    }

    public SortedSet<Factor> getAllFactors() {
        return ImmutableSortedSet.copyOf(factorsByType.values());
    }

    public int getFactorIndex(FactorGroup factorGroup) {
        return orderedFactorGroups.indexOf(factorGroup);
    }

    // ordered the same as the assay group ids in the expression levels .tsv
    public ImmutableList<FactorGroup> getOrderedFactorGroups() {
        return ImmutableList.copyOf(orderedFactorGroups);
    }

    @Override
    public String toString() {
        return "ExperimentalFactors: orderedFactorGroups = " + orderedFactorGroups
                + ", factorsByType = " + factorsByType;
    }
}
