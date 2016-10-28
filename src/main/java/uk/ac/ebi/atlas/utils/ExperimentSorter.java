package uk.ac.ebi.atlas.utils;

import com.google.common.collect.Ordering;
import com.google.common.collect.TreeMultimap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.model.ExperimentType;
import uk.ac.ebi.atlas.trader.ExperimentTrader;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.MessageFormat;
import java.util.Collections;

@Named
@Scope("singleton")
public class ExperimentSorter {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExperimentSorter.class);

    @Value("#{configuration['experiment.magetab.path.template']}")
    private String baselineTsvFileTemplate;

    @Value("#{configuration['diff.experiment.data.path.template']}")
    private String differentialTsvFileTemplate;

    private ExperimentTrader experimentTrader;

    @Inject
    public ExperimentSorter(ExperimentTrader experimentTrader) {
        this.experimentTrader = experimentTrader;
    }

    public TreeMultimap<Long, String> reverseSortAllExperimentsPerSize() {
        return reverseSortExperimentsPerSize(
                ExperimentType.MICROARRAY_1COLOUR_MRNA_DIFFERENTIAL,
                ExperimentType.MICROARRAY_1COLOUR_MICRORNA_DIFFERENTIAL,
                ExperimentType.MICROARRAY_2COLOUR_MRNA_DIFFERENTIAL,
                ExperimentType.RNASEQ_MRNA_DIFFERENTIAL,
                ExperimentType.RNASEQ_MRNA_BASELINE,
                ExperimentType.PROTEOMICS_BASELINE);
    }

    public TreeMultimap<Long, String> reverseSortExperimentsPerSize(ExperimentType... experimentTypes) {
        TreeMultimap<Long, String> fileSizeToExperimentsMap = TreeMultimap.create(Collections.reverseOrder(), Ordering.natural());

        for (ExperimentType experimentType : experimentTypes) {

            for (String experimentAccession : experimentTrader.getPublicExperimentAccessions(experimentType)) {
                fileSizeToExperimentsMap.put
                        (experimentType.isDifferential()
                                ? estimateSizeOfDifferentialExperiment(experimentAccession)
                                : estimateSizeOfBaselineExperiment(experimentAccession),
                                experimentAccession);
            }

        }

        return fileSizeToExperimentsMap;
    }

    private long estimateSizeOfDifferentialExperiment(String experimentAccession){
        long diffExperimentSize = 0;
        Path diffExperimentDir = FileSystems.getDefault().getPath(MessageFormat.format(differentialTsvFileTemplate, experimentAccession)).getParent();
        Path diffExperimentGlobPath = FileSystems.getDefault().getPath(MessageFormat.format(differentialTsvFileTemplate, experimentAccession + "*")).getFileName();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(diffExperimentDir, diffExperimentGlobPath.toString())) {
            for (Path path : stream) {
                diffExperimentSize += new File(String.valueOf(path)).length();
            }
        } catch (IOException e) {
            LOGGER.error(e.getMessage());
        }
        return diffExperimentSize;
    }

    private long estimateSizeOfBaselineExperiment(String experimentAccession){
        String tsvFilePath = MessageFormat.format(baselineTsvFileTemplate, experimentAccession);
        return new File(tsvFilePath).length();
    }
}