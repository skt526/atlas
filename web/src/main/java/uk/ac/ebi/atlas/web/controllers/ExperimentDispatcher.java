/*
 * Copyright 2008-2012 Microarray Informatics Team, EMBL-European Bioinformatics Institute
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

package uk.ac.ebi.atlas.web.controllers;

import org.apache.commons.lang.StringUtils;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import uk.ac.ebi.atlas.model.Experiment;
import uk.ac.ebi.atlas.model.baseline.BaselineExperiment;
import uk.ac.ebi.atlas.model.cache.baseline.BaselineExperimentsCache;
import uk.ac.ebi.atlas.model.cache.differential.DifferentialExperimentsCache;
import uk.ac.ebi.atlas.web.ApplicationProperties;
import uk.ac.ebi.atlas.web.controllers.ResourceNotFoundException;
import uk.ac.ebi.atlas.web.interceptors.ExperimentInterceptor;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import java.util.Set;

/**
 * Overview:
 * this is a proxy router / interceptor controller that makes up for the lack of workflow handling mechanisms in Spring MVC (HandlerInterceptors are a very poor thing).
 * It intercepts requests for any resource or sub-resource related to any experiment
 * and implements the following responsibilities:
 *
 * experiment lookup / experiment resolver
 * - lookup the experiment across different caches
 * -- if there is no experiment for the given accession then http response is routed to 404 - resource not fount
 * view decorator (to keep delegated controllers DRY)
 * - add the experiment to the HttpServletRequest, for any delegated controller to use it
 * - add model attributes that are required by all experiment related views
 *   (i.e. required by layout elements that are shared by all experiment views)
 * proxy router for specialized controllers
 * - resolve experiment type (baseline or differential)
 * - forward to the original request URI,
 *   but adding a "type = baseline" | "type=differential" http parameter.
 *   This last step enables routing to different delegated controllers depending on the type of the requested experiment.
 *   Each controller will have to specify params="type=baseline" or params="type=differential" or params="type" in order
 *   to handle baseline experiments, differential experiments, or both.
 *
 * Note: the original query string - request.getQueryString() - is not re-appended to the forwarded request URI
 * because Spring MVC processes and transforms it into ModelAttribute(s) that will be
 * automatically / transparently available to delegated controller,
 * without any need for controller to access the query string.
 *
 * If more complex request mappings are required (i.e. url exclusions) this post may help:
 * http://stackoverflow.com/questions/8998419/requestmapping-annotation-in-spring-mvc
 * For a Spring MVC reference:
 * http://static.springsource.org/spring/docs/3.2.x/spring-framework-reference/html/mvc.html
 */

@Controller
public class ExperimentDispatcher {

    public static final String EXPERIMENT_ATTRIBUTE = "experiment";
    private static final String ALL_SPECIES_ATTRIBUTE = "allSpecies";
    private static final String EXPERIMENT_DESCRIPTION_ATTRIBUTE = "experimentDescription";
    private static final String HAS_EXTRA_INFO_ATTRIBUTE = "hasExtraInfo";

    private BaselineExperimentsCache baselineExperimentsCache;
    private DifferentialExperimentsCache differentialExperimentsCache;
    private ApplicationProperties applicationProperties;

    @Inject
    private ExperimentDispatcher(BaselineExperimentsCache baselineExperimentsCache, DifferentialExperimentsCache differentialExperimentsCache, ApplicationProperties applicationProperties){
        this.baselineExperimentsCache = baselineExperimentsCache;
        this.differentialExperimentsCache = differentialExperimentsCache;
        this.applicationProperties = applicationProperties;
    }

    @RequestMapping(value ={ "/experiments/{experimentAccession}",
                             "/experiments/{experimentAccession}.tsv",
                             "/experiments/{experimentAccession}/*" })
    public String dispatch(HttpServletRequest request, @PathVariable String experimentAccession, Model model) {

        if (!applicationProperties.getExperimentIdentifiers().contains(experimentAccession)) {
            throw new ResourceNotFoundException();
        }

        Experiment experiment = getExperiment(experimentAccession);

        request.setAttribute(EXPERIMENT_ATTRIBUTE, experiment);

        Set<String> allSpecies = experiment.getSpecies();

        model.addAttribute(ALL_SPECIES_ATTRIBUTE, StringUtils.join(allSpecies, ", "));

        model.addAttribute(EXPERIMENT_DESCRIPTION_ATTRIBUTE, experiment.getDescription());

        model.addAttribute(HAS_EXTRA_INFO_ATTRIBUTE, experiment.hasExtraInfoFile());

        String contextPath = request.getContextPath();
        String requestURI = request.getRequestURI();

        String requestURL = StringUtils.substringAfter(requestURI,contextPath);

        return "forward:" + requestURL + "?type=" + getExperimentType(experiment);
    }

    private String getExperimentType(Experiment experiment) {
        return experiment instanceof BaselineExperiment ?  "baseline" : "differential";
    }

    Experiment getExperiment(String experimentAccession) {
        Experiment experiment = baselineExperimentsCache.getExperiment(experimentAccession);
        if (experiment == null) {
            experiment = differentialExperimentsCache.getExperiment(experimentAccession);
        }
        return experiment;
    }

}
