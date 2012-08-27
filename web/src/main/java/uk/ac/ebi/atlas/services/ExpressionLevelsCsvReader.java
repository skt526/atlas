package uk.ac.ebi.atlas.services;


import au.com.bytecode.opencsv.CSVReader;
import com.google.common.base.Function;
import com.google.common.collect.Ordering;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.log4j.Logger;
import uk.ac.ebi.atlas.model.ExperimentRun;
import uk.ac.ebi.atlas.model.ExpressionLevel;

import java.io.IOException;
import java.io.Reader;
import java.util.*;

//ToDo: rename this class into ExpressionLevelsInputStream, that is more coherent with JDK API and in general is better to avoid names that describe roles (ending in -er -or), they are too generic and introduce functional - dataflow drift
public class ExpressionLevelsCsvReader implements ObjectInputStream<ExpressionLevel> {

    private static final Logger logger = Logger.getLogger(ExpressionLevelsCsvReader.class);
    public static final int TRANSACTION_ID_COLUMN = 0;

    private CSVReader csvReader;

    private ExpressionLevelsBuffer expressionLevelBuffer;

    ExpressionLevelsCsvReader(CSVReader csvReader, List<ExperimentRun> experimentRuns) {
        this.csvReader = csvReader;
        initializeBuffer(experimentRuns);
    }


    public ExpressionLevelsCsvReader(Reader reader, List<ExperimentRun> experimentRuns) {
        this(new CSVReader(reader, '\t'), experimentRuns);
    }


    void initializeBuffer(List<ExperimentRun> experimentRuns) {
        String[] firstLine = readCsvLine();
        final List<String> orderSpecification = Arrays.asList(ArrayUtils.remove(firstLine, TRANSACTION_ID_COLUMN));

        Collections.sort(experimentRuns, buildExperimentRunComparator(orderSpecification));
        expressionLevelBuffer = new ExpressionLevelsBuffer(experimentRuns);
    }


    Comparator<ExperimentRun> buildExperimentRunComparator(final List<String> orderSpecification) {

        return Ordering.natural().onResultOf(new Function<ExperimentRun, Integer>() {
            @Override
            public Integer apply(ExperimentRun experimentRun) {
                int orderIndexOfRun = orderSpecification.indexOf(experimentRun.getRunAccession());
                return orderIndexOfRun;
            }
        });
    }


    @Override
    public ExpressionLevel readNext() {
        ExpressionLevel expressionLevel = expressionLevelBuffer.poll();

        if (expressionLevel == null) {

            String[] values = readCsvLine();
            if (values == null) {
                return null;
            }
            expressionLevelBuffer.reload(values);
            expressionLevel = expressionLevelBuffer.poll();
        }

        return expressionLevel;
    }


    String[] readCsvLine() {
        try {

            return csvReader.readNext();

        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new IllegalStateException("Exception thrown while reading next csv line: " + e.getMessage());
        }
    }


    @Override
    public void close() throws IOException {
        csvReader.close();
    }

}
