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

import com.google.common.base.Function;
import com.google.common.collect.Lists;

import java.util.ArrayList;
import java.util.List;

public class DifferentialBioentityExpressions extends ArrayList<DifferentialBioentityExpression> implements DifferentialExpressionLimits {

    private int totalNumberOfResults;

    public DifferentialBioentityExpressions(int totalNumberOfResults){
        this.totalNumberOfResults = totalNumberOfResults;
    }

    public DifferentialBioentityExpressions(List<DifferentialBioentityExpression> differentialBioentityExpressions, int totalNumberOfResults) {
        super(differentialBioentityExpressions);
        this.totalNumberOfResults = totalNumberOfResults;
    }

    public double getMaxUpRegulatedExpressionLevel() {
        return new FindTopLevelByRegulation(Regulation.UP).apply(this);
    }

    public double getMinUpRegulatedExpressionLevel() {
        return new FindTopLevelByRegulation(Regulation.UP).apply(Lists.reverse(this));
    }

    public double getMaxDownRegulatedExpressionLevel() {
        return new FindTopLevelByRegulation(Regulation.DOWN).apply(this);
    }

    public double getMinDownRegulatedExpressionLevel() {
        return new FindTopLevelByRegulation(Regulation.DOWN).apply(Lists.reverse(this));
    }

    public int getTotalNumberOfResults() {
        return totalNumberOfResults;
    }

    static class FindTopLevelByRegulation implements Function<List<DifferentialBioentityExpression>, Double>{

        private Regulation regulation;

        public FindTopLevelByRegulation(Regulation regulation){

            this.regulation = regulation;
        }

        @Override
        public Double apply(List<DifferentialBioentityExpression> sortedExpressions) {
            for(DifferentialBioentityExpression differentialBioentityExpression:sortedExpressions){
                DifferentialExpression differentialExpression = differentialBioentityExpression.getExpression();
                if (differentialExpression.isRegulatedLike(regulation)){
                    return differentialExpression.getLevel();
                }
            }
            return Double.NaN;
        }
    }

}


