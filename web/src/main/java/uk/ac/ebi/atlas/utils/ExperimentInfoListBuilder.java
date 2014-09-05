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

package uk.ac.ebi.atlas.utils;

import com.google.common.collect.Lists;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.model.Experiment;
import uk.ac.ebi.atlas.model.ExperimentDesign;
import uk.ac.ebi.atlas.model.baseline.BaselineExperiment;
import uk.ac.ebi.atlas.model.differential.DifferentialExperiment;
import uk.ac.ebi.atlas.model.differential.microarray.MicroarrayExperiment;
import uk.ac.ebi.atlas.trader.ArrayDesignTrader;
import uk.ac.ebi.atlas.trader.ExperimentTrader;
import uk.ac.ebi.atlas.trader.cache.BaselineExperimentsCache;
import uk.ac.ebi.atlas.trader.cache.MicroarrayExperimentsCache;
import uk.ac.ebi.atlas.trader.cache.RnaSeqDiffExperimentsCache;

import javax.inject.Inject;
import javax.inject.Named;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.List;

@Named
@Scope("prototype")
public class ExperimentInfoListBuilder {

    private BaselineExperimentsCache baselineExperimentsCache;

    private RnaSeqDiffExperimentsCache rnaSeqDiffExperimentsCache;

    private MicroarrayExperimentsCache microarrayExperimentsCache;

    private ExperimentTrader experimentTrader;

    private ArrayDesignTrader arrayDesignTrader;

    @Inject
    public ExperimentInfoListBuilder(ExperimentTrader experimentTrader,
                                     BaselineExperimentsCache baselineExperimentsCache,
                                     RnaSeqDiffExperimentsCache rnaSeqDiffExperimentsCache,
                                     MicroarrayExperimentsCache microarrayExperimentsCache,
                                     ArrayDesignTrader arrayDesignTrader) {
        this.experimentTrader = experimentTrader;
        this.baselineExperimentsCache = baselineExperimentsCache;
        this.rnaSeqDiffExperimentsCache = rnaSeqDiffExperimentsCache;
        this.microarrayExperimentsCache = microarrayExperimentsCache;
        this.arrayDesignTrader = arrayDesignTrader;
    }

    public List<ExperimentInfo> build() {

        List<ExperimentInfo> experimentInfos = Lists.newArrayList();
        experimentInfos.addAll(extractBaselineExperiments());
        experimentInfos.addAll(extractRnaSeqDiffExperiments());
        experimentInfos.addAll(extractMicrorarryExperiments());

        return experimentInfos;
    }

    protected List<ExperimentInfo> extractMicrorarryExperiments() {

        List<ExperimentInfo> experimentInfos = Lists.newArrayList();

        for (String experimentAccession : experimentTrader.getMicroarrayExperimentAccessions()) {
            MicroarrayExperiment experiment = microarrayExperimentsCache.getExperiment(experimentAccession);

            ExperimentInfo experimentInfo = extractBasicExperimentInfo(experiment);
            experimentInfo.setNumberOfAssays(experiment.getAssayAccessions().size());
            experimentInfo.setNumberOfContrasts(experiment.getContrastIds().size());
            experimentInfo.setArrayDesigns(experiment.getArrayDesignAccessions());
            experimentInfo.setArrayDesignNames(arrayDesignTrader.getArrayDesignNames(experiment.getArrayDesignAccessions()));

            experimentInfos.add(experimentInfo);
        }

        return experimentInfos;
    }

    protected List<ExperimentInfo> extractRnaSeqDiffExperiments() {

        List<ExperimentInfo> experimentInfos = Lists.newArrayList();

        for (String experimentAccession : experimentTrader.getRnaSeqDifferentialExperimentAccessions()) {
            DifferentialExperiment experiment = rnaSeqDiffExperimentsCache.getExperiment(experimentAccession);

            ExperimentInfo experimentInfo = extractBasicExperimentInfo(experiment);
            experimentInfo.setNumberOfAssays(experiment.getAssayAccessions().size());
            experimentInfo.setNumberOfContrasts(experiment.getContrastIds().size());

            experimentInfos.add(experimentInfo);
        }

        return experimentInfos;
    }

    protected List<ExperimentInfo> extractBaselineExperiments() {

        List<ExperimentInfo> experimentInfos = Lists.newArrayList();

        for (String experimentAccession : experimentTrader.getBaselineExperimentAccessions()) {
            BaselineExperiment experiment = baselineExperimentsCache.getExperiment(experimentAccession);

            ExperimentInfo experimentInfo = extractBasicExperimentInfo(experiment);
            experimentInfo.setNumberOfAssays(experiment.getExperimentRunAccessions().size());

            experimentInfos.add(experimentInfo);
        }

        return experimentInfos;
    }

    protected ExperimentInfo extractBasicExperimentInfo(Experiment experiment) {
        ExperimentDesign experimentDesign = experiment.getExperimentDesign();

        ExperimentInfo experimentInfo = new ExperimentInfo();
        experimentInfo.setExperimentAccession(experiment.getAccession());
        DateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
        experimentInfo.setLastUpdate(dateFormat.format(experiment.getLastUpdate()));
        experimentInfo.setExperimentDescription(experiment.getDescription());
        experimentInfo.setSpecies(experiment.getOrganisms());
        //ToDo: there are only types (RNASEQ_MRNA_BASELINE, RNASEQ_MRNA_DIFFERENTIAL, MICROARRAY_ANY)
        experimentInfo.setExperimentType(experiment.getType().getParent());
        experimentInfo.setExperimentalFactors(experimentDesign.getFactorHeaders());

        return experimentInfo;
    }

}