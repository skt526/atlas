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

package uk.ac.ebi.atlas.experimentimport.experimentdesign;

import au.com.bytecode.opencsv.CSVWriter;
import com.google.common.collect.Lists;
import uk.ac.ebi.atlas.model.ExperimentDesign;
import uk.ac.ebi.atlas.model.ExperimentType;
import uk.ac.ebi.atlas.model.SampleCharacteristic;
import uk.ac.ebi.atlas.model.baseline.Factor;

import java.io.IOException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.SortedSet;

public class ExperimentDesignFileWriter {

    private static final String SAMPLE_CHARACTERISTICS_NAME_HEADER_TEMPLATE = "Sample Characteristic[{0}]";
    private static final String SAMPLE_CHARACTERISTICS_ONTOLOGY_TERM_HEADER_TEMPLATE = "Sample Characteristic Ontology Term[{0}]";
    private static final String FACTOR_NAME_HEADER_TEMPLATE = "Factor Value[{0}]";
    private static final String FACTOR_VALUE_ONTOLOGY_TERM_TEMPLATE = "Factor Value Ontology Term[{0}]";

    private CSVWriter csvWriter;
    private ExperimentType experimentType;

    ExperimentDesignFileWriter(CSVWriter csvWriter, ExperimentType experimentType){
        this.csvWriter = csvWriter;
        this.experimentType = experimentType;
    }

    public void write(ExperimentDesign experimentDesign) throws IOException {
        try {

            String[] columnHeaders = buildColumnHeaders(experimentType, experimentDesign);
            csvWriter.writeNext(columnHeaders);
            csvWriter.writeAll(asTableOntologyTermsData(experimentDesign));
            csvWriter.flush();
        }finally {
            csvWriter.close();
        }

    }

    String[] buildColumnHeaders(ExperimentType experimentType, ExperimentDesign experimentDesign) {

        List<String> headers = Lists.newArrayList(getCommonColumnHeaders(experimentType));
        headers.addAll(toHeaders(experimentDesign.getSampleHeaders(), SAMPLE_CHARACTERISTICS_NAME_HEADER_TEMPLATE, SAMPLE_CHARACTERISTICS_ONTOLOGY_TERM_HEADER_TEMPLATE));
        headers.addAll(toHeaders(experimentDesign.getFactorHeaders(), FACTOR_NAME_HEADER_TEMPLATE, FACTOR_VALUE_ONTOLOGY_TERM_TEMPLATE));

        return headers.toArray(new String[headers.size()]);
    }

    List<String> toHeaders(SortedSet<String> propertyNames, final String headerTemplate1, final String headerTemplate2) {
        List<String> headers = new ArrayList<>();
        for (String propertyName: propertyNames){
            headers.add(MessageFormat.format(headerTemplate1, propertyName));
            headers.add(MessageFormat.format(headerTemplate2, propertyName));
        }
        return headers;
    }

    protected List<String> getCommonColumnHeaders(ExperimentType experimentType){
        switch(experimentType.getParent()){
            case MICROARRAY_ANY:
                return Lists.newArrayList("Assay", "Array");
            case RNASEQ_MRNA_BASELINE:
            case RNASEQ_MRNA_DIFFERENTIAL:
            case PROTEOMICS_BASELINE:
                return Lists.newArrayList("Run");
            default:
                throw new IllegalStateException("Invalid parent type: " + experimentType.getParent());
        }
    }

    public List<String[]> asTableOntologyTermsData(ExperimentDesign experimentDesign) {
        List<String[]> tableData = Lists.newArrayList();
        for (String runOrAssay : experimentDesign.getAllRunOrAssay()) {
            tableData.add(composeTableRowWithOntologyTerms(experimentDesign, runOrAssay));
        }
        return tableData;
    }

    protected String[] composeTableRowWithOntologyTerms(ExperimentDesign experimentDesign, String runOrAssay) {
        List<String> row = Lists.newArrayList(runOrAssay);

        String arrayDesign = experimentDesign.getArrayDesign(runOrAssay);
        if (arrayDesign != null) {
            row.add(arrayDesign);
        }

        for (String sampleHeader : experimentDesign.getSampleHeaders()) {
            SampleCharacteristic sampleCharacteristic = experimentDesign.getSampleCharacteristic(runOrAssay, sampleHeader);
            addSampleCharacteristicValue(row, sampleCharacteristic);
            addSampleCharacteristicOntologyTerm(row, sampleCharacteristic);
        }

        for (String factorHeader : experimentDesign.getFactorHeaders()) {
            Factor factor = experimentDesign.getFactor(runOrAssay, factorHeader);
            addFactorValue(row, factor);
            addFactorValueOntologyTerm(row, factor);
        }

        return row.toArray(new String[row.size()]);
    }

    private void addFactorValue(List<String> row, Factor factor) {
        String factorValue = (factor == null) ? null : factor.getValue();
        row.add(factorValue);
    }

    private void addFactorValueOntologyTerm(List<String> row, Factor factor) {
        String factorValueOntologyTermId = (factor == null) ? null : factor.getValueOntologyTermUri();
        row.add(factorValueOntologyTermId);
    }

    private void addSampleCharacteristicValue(List<String> row, SampleCharacteristic sampleCharacteristic) {
        String value = (sampleCharacteristic == null) ? null : sampleCharacteristic.value();
        row.add(value);
    }

    private void addSampleCharacteristicOntologyTerm(List<String> row, SampleCharacteristic sampleCharacteristic) {
        String ontologyTermId = (sampleCharacteristic == null) ? null : sampleCharacteristic.getValueOntologyTermUri();
        row.add(ontologyTermId);
    }

}
