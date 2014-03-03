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

package uk.ac.ebi.atlas.model.differential;

import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import org.springframework.util.CollectionUtils;

import java.util.Comparator;
import java.util.Set;

public class DifferentialProfileComparator<T extends DifferentialProfile> implements Comparator<T> {

    private boolean isSpecific;
    private Set<Contrast> selectedQueryContrasts;
    private Set<Contrast> allQueryContrasts;
    private Regulation regulation;

    public DifferentialProfileComparator(boolean isSpecific, Set<Contrast> selectedQueryContrasts,
                                         Set<Contrast> allQueryContrasts, Regulation regulation) {
        this.isSpecific = isSpecific;
        this.selectedQueryContrasts = selectedQueryContrasts;
        this.allQueryContrasts = allQueryContrasts;
        //This is needed to bring up genes which are expressed only in selected tissues when cutoff is 0.
        this.regulation = regulation;
    }

    @Override
    public int compare(T firstProfile, T otherProfile) {

        // A1:
        if (isSpecific && CollectionUtils.isEmpty(selectedQueryContrasts)) {
            int order = Integer.compare(firstProfile.getSpecificity(regulation), otherProfile.getSpecificity(regulation));
            if (0 == order) {
                order = compareOnAverageExpressionLevel(firstProfile, otherProfile, allQueryContrasts);
            }
            if (0 == order) {
                order = compareOnAveragePValue(firstProfile, otherProfile, allQueryContrasts);
            }
            if (0 == order) {
                order = firstProfile.getName().compareTo(otherProfile.getName());
            }
            return order;
        }

        // B1:
        if (isSpecific && !CollectionUtils.isEmpty(selectedQueryContrasts)) {
            int order = Ordering.natural().compare(
                    getExpressionLevelFoldChange(firstProfile),
                    getExpressionLevelFoldChange(otherProfile));
            if (0 == order) {
                order = compareOnAverageExpressionLevel(firstProfile, otherProfile, selectedQueryContrasts);
            }
            if (0 == order) {
                order = compareOnAveragePValue(firstProfile, otherProfile, selectedQueryContrasts);
            }
            if (0 == order) {
                order = firstProfile.getName().compareTo(otherProfile.getName());
            }
            return order;

        }

        // A2
        if (!isSpecific && CollectionUtils.isEmpty(selectedQueryContrasts)) {
            int order = compareOnAverageExpressionLevel(firstProfile, otherProfile, allQueryContrasts);
            if (0 == order) {
                order = compareOnAveragePValue(firstProfile, otherProfile, allQueryContrasts);
            }
            if (0 == order) {
                order = firstProfile.getName().compareTo(otherProfile.getName());
            }
            return order;
        }

        // B2 - !specific && !CollectionUtils.isEmpty
        int order = compareOnAverageExpressionLevel(firstProfile, otherProfile, selectedQueryContrasts);
        if (0 == order) {
            order = compareOnAveragePValue(firstProfile, otherProfile, selectedQueryContrasts);
        }
        if (0 == order) {
            order = firstProfile.getName().compareTo(otherProfile.getName());
        }
        return order;

    }

    private int compareOnAveragePValue(DifferentialProfile firstProfile, DifferentialProfile otherProfile, Set<Contrast> contrasts) {
        double firstProfileAverageExpressionLevel = firstProfile.getAveragePValueOn(contrasts);
        double otherProfileAverageExpressionLevel = otherProfile.getAveragePValueOn(contrasts);
        return Double.compare(firstProfileAverageExpressionLevel, otherProfileAverageExpressionLevel);
    }

    protected int compareOnAverageExpressionLevel(DifferentialProfile firstProfile, DifferentialProfile otherProfile,
                                                  Set<Contrast> contrasts) {
        double firstProfileAverageExpressionLevel = firstProfile.getAverageExpressionLevelOn(contrasts);
        double otherProfileAverageExpressionLevel = otherProfile.getAverageExpressionLevelOn(contrasts);
        return Double.compare(otherProfileAverageExpressionLevel, firstProfileAverageExpressionLevel);
    }

    public double getExpressionLevelFoldChange(DifferentialProfile differentialProfile) {

        Set<Contrast> nonSelectedQueryContrasts = Sets.difference(allQueryContrasts, selectedQueryContrasts);

        double minExpressionLevelOnNonSelectedQueryContrasts = differentialProfile.getStrongestExpressionLevelOn(nonSelectedQueryContrasts);

        double averageExpressionLevelOnSelectedQueryContrasts = differentialProfile.getAverageExpressionLevelOn(selectedQueryContrasts);

        if (averageExpressionLevelOnSelectedQueryContrasts == 0) {
            return minExpressionLevelOnNonSelectedQueryContrasts / Double.MIN_VALUE;
        }

        return minExpressionLevelOnNonSelectedQueryContrasts / averageExpressionLevelOnSelectedQueryContrasts;
    }

}