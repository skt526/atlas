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

package uk.ac.ebi.atlas.web;

import com.google.common.base.Objects;
import org.apache.commons.lang.StringUtils;
import org.hibernate.validator.constraints.Range;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.SortedSet;


public abstract class ExperimentPageRequestPreferences {

    static final int DEFAULT_NUMBER_OF_RANKED_GENES = 50;

    private static final int GENE_QUERY_MAX_LENGTH = 900;

    private static final int EXPRESSION_LEVEL_MIN = 0;

    private static final int HEATMAP_SIZE_MIN = 0;

    private static final int HEATMAP_SIZE_MAX = 1000;

    @Size(max = GENE_QUERY_MAX_LENGTH,
            message = "The gene query expression is too long, please limit it to a maximum length of 900 characters")
    private String geneQuery = getDefaultGeneQuery();

    @Min(value = EXPRESSION_LEVEL_MIN, message = "The expression level cutoff must be greater than 0")
    private Double cutoff = getDefaultCutoff();

    private String serializedFilterFactors;

    private String queryFactorType;

    private SortedSet<String> queryFactorValues;

    @NotNull
    @Range(min = HEATMAP_SIZE_MIN, max = HEATMAP_SIZE_MAX)
    private Integer heatmapMatrixSize = DEFAULT_NUMBER_OF_RANKED_GENES;

    private boolean specific = true;

    private boolean exactMatch = true;

    private boolean displayLevels;

    private boolean displayGeneDistribution;

    private boolean geneSetMatch;

    protected ExperimentPageRequestPreferences() {

    }

    public SortedSet<String> getQueryFactorValues() {
        return queryFactorValues;
    }

    public void setQueryFactorValues(SortedSet<String> queryFactorValues) {
        this.queryFactorValues = queryFactorValues;
    }

    public String getQueryFactorType() {
        return queryFactorType;
    }

    public void setQueryFactorType(String type) {
        this.queryFactorType = type;
    }

    public String getSerializedFilterFactors() {
        return serializedFilterFactors;
    }

    public void setSerializedFilterFactors(String serializedFilterFactors) {
        this.serializedFilterFactors = serializedFilterFactors;
    }

    public boolean isDisplayGeneDistribution() {
        return displayGeneDistribution;
    }

    public void setDisplayGeneDistribution(boolean displayGeneDistribution) {
        this.displayGeneDistribution = displayGeneDistribution;
    }

    public Integer getHeatmapMatrixSize() {
        return this.heatmapMatrixSize;
    }

    public void setHeatmapMatrixSize(Integer heatmapMatrixSize) {
        if (heatmapMatrixSize != null) {
            this.heatmapMatrixSize = heatmapMatrixSize;
        }
    }

    public Double getCutoff() {
        return this.cutoff;
    }

    //must be public because the jsp needs to access it
    public abstract Double getDefaultCutoff();

    protected abstract String getDefaultGeneQuery();

    public void setCutoff(Double cutoff) {
        if (cutoff != null) {
            this.cutoff = cutoff;
        }
    }

    public boolean isSpecific() {
        return this.specific;
    }

    public void setSpecific(boolean specific) {
        this.specific = specific;
    }

    public boolean isGeneSetMatch() {
        return geneSetMatch;
    }

    public void setGeneSetMatch(boolean geneSetMatch) {
        this.geneSetMatch = geneSetMatch;
    }

    public boolean getDisplayLevels() {
        return displayLevels;
    }

    public void setDisplayLevels(boolean displayLevels) {
        this.displayLevels = displayLevels;
    }

    public String getGeneQuery() {
        return this.geneQuery;
    }

    public void setGeneQuery(String geneQuery) {
        if (!areQuotesMatching(geneQuery)) {
            this.geneQuery = geneQuery + "\"";
        } else {
            this.geneQuery = geneQuery;
        }
    }

    boolean areQuotesMatching(String searchText) {
        int numberOfDoubleQuotes = StringUtils.countMatches(searchText, "\"");
        return numberOfDoubleQuotes % 2 == 0;
    }


    public String toString() {
        return Objects.toStringHelper(this.getClass())
                .add("geneQuery", geneQuery)
                .add("queryFactorType", queryFactorType)
                .add("cutoff", cutoff)
                .add("serializedFilterFactors", serializedFilterFactors)
                .add("specific", specific)
                .add("exactMatch", exactMatch)
                .toString();
    }

    public boolean isExactMatch() {
        return exactMatch;
    }

    public void setExactMatch(boolean exactMatch) {
        this.exactMatch = exactMatch;
    }

}
