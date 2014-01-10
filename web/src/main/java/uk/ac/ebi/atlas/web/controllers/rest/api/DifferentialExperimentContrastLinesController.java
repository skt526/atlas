package uk.ac.ebi.atlas.web.controllers.rest.api;

import com.google.common.base.Joiner;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import uk.ac.ebi.atlas.model.differential.DifferentialExperiment;
import uk.ac.ebi.atlas.thirdpartyintegration.ebeye.DifferentialExperimentContrastLines;
import uk.ac.ebi.atlas.trader.ExperimentTrader;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: barrera
 * Date: 09/01/2014
 *
 * Generates a tsv url with a List of all contrast details for all differential experiments
 *
 */
@Controller
@Scope("request")
public class DifferentialExperimentContrastLinesController {

    private ExperimentTrader experimentTrader;

    @Inject
    public DifferentialExperimentContrastLinesController(ExperimentTrader experimentTrader) {
        this.experimentTrader = experimentTrader;
    }

    @RequestMapping(value = "/api/contrastdetails.tsv", method = RequestMethod.GET)
    public void generateTsvFormat(HttpServletResponse response) throws IOException {
        getAllDifferentialExperimentsContrastLines(response);
    }

    private void getAllDifferentialExperimentsContrastLines(HttpServletResponse response) throws IOException {
        DifferentialExperimentContrastLines diffExperimentContrastLines;
        DifferentialExperiment differentialExperiment;

        Set<String> microArrayExpAccessions = new HashSet<>(experimentTrader.getMicroarrayExperimentAccessions());
        Set<String> rnaSeqDiffExpAccessions = new HashSet<>(experimentTrader.getRnaSeqDifferentialExperimentAccessions());

        List<String> allExperimentsList = new ArrayList<>();
        allExperimentsList.addAll(microArrayExpAccessions);
        allExperimentsList.addAll(rnaSeqDiffExpAccessions);

        for(String experimentAccession : allExperimentsList){
            differentialExperiment = (DifferentialExperiment) experimentTrader.getPublicExperiment(experimentAccession);
            diffExperimentContrastLines = new DifferentialExperimentContrastLines(differentialExperiment);
            extractLinesToTSVFormat(diffExperimentContrastLines, response);
        }
    }

    private void extractLinesToTSVFormat(DifferentialExperimentContrastLines diffExperimentContrastLines, HttpServletResponse response) throws IOException {
        PrintWriter writer = response.getWriter();

        response.setContentType("text/tab-separated-values");

        Iterator<String[]> lines = diffExperimentContrastLines.iterator();

        while (lines.hasNext()){
            String[] line = lines.next();
            String lineTab = Joiner.on("\t").join(line);
            writer.write(lineTab + "\n");
        }
    }
}
