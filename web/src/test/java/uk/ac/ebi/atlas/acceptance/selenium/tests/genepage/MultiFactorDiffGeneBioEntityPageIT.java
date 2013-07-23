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

package uk.ac.ebi.atlas.acceptance.selenium.tests.genepage;

import org.junit.Test;
import uk.ac.ebi.atlas.acceptance.selenium.pages.BioEntityPage;
import uk.ac.ebi.atlas.acceptance.selenium.utils.SinglePageSeleniumFixture;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.is;

public class MultiFactorDiffGeneBioEntityPageIT extends SinglePageSeleniumFixture {

    private static final String GENE_IDENTIFIER = "AT3G11340";

    private BioEntityPage subject;

    @Override
    protected void getStartingPage() {
        subject = new BioEntityPage(driver, GENE_IDENTIFIER, "genes", "cutoff=0.5&openPanelIndex=2");
        subject.get();
        subject.useDiffHeatmapTable();
    }

    @Test
    public void checkPaneExpansion() {
        assertThat(subject.isDifferentialProfileExpanded(), is(true));
    }

    @Test
    public void checkSelectedProfiles() {
        subject.clickDisplayLevelsButton();
        assertThat(subject.getSelectedProfiles(), contains(
                "treatment: 'salicylic acid' vs 'Silwet' at time: '4 hours' in ecotype: 'Col-0'",
                "treatment: 'salicylic acid' vs 'Silwet' at time: '28 hours' in ecotype: 'Col-0'"));
        assertThat(subject.getFirstGeneProfile(), contains("8.94 × 10-4"));
        assertThat(subject.getLastGeneProfile(), contains("0.186"));
        assertThat(subject.getSelectedProfiles().size(), is(2));
    }

    @Test
    public void checkContrastSummaryTooltipTableHeader() {
        assertThat(subject.getContastSummaryTooltipTableHeader(0, 0), is("Property"));
        assertThat(subject.getContastSummaryTooltipTableHeader(0, 1), is("Test value"));
        assertThat(subject.getContastSummaryTooltipTableHeader(0, 2), is("Reference value"));
    }

    @Test
    public void checkContrastSummaryTooltipTableFirstRow() {
        assertThat(subject.getContastSummaryTooltipTableData(0, 0, 0), is("ecotype"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 0, 1), is("Col-0"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 0, 2), is("Col-0"));
    }

    @Test
    public void checkContrastSummaryTooltipTableSecondRow() {
        assertThat(subject.getContastSummaryTooltipTableData(0, 1, 0), is("growth condition"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 1, 1), is("0.3 millimolar salicylic acid"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 1, 2), is("0.02 percent Silwet"));
    }

    @Test
    public void checkContrastSummaryTooltipTableThirdRow() {
        assertThat(subject.getContastSummaryTooltipTableData(0, 2, 0), is("time"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 2, 1), is("4"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 2, 2), is("4"));
    }

    @Test
    public void checkContrastSummaryTooltipTableFourthRow() {
        assertThat(subject.getContastSummaryTooltipTableData(0, 3, 0), is("age"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 3, 1), is("6-7"));
        assertThat(subject.getContastSummaryTooltipTableData(0, 3, 2), is("6-7"));
    }

    @Test
    public void checkContrastSummaryTooltipExperimentAndContrastDescription() {
        assertThat(subject.getContastSummaryTooltipExperimentDescription(0), is("Transcription profiling by array of seven ecotypes of Arabidopsis thaliana after time course treatment with salicylic acid."));
        assertThat(subject.getContastSummaryTooltipContrastDescription(0), is("treatment: 'salicylic acid' vs 'Silwet' at time: '4 hours' in ecotype: 'Col-0'"));
    }

}
