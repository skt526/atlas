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

package uk.ac.ebi.atlas.commands;

import com.google.common.collect.Sets;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import uk.ac.ebi.atlas.geneindex.SolrClient;
import uk.ac.ebi.atlas.model.Experiment;
import uk.ac.ebi.atlas.model.ExperimentalFactors;
import uk.ac.ebi.atlas.model.caches.ExperimentsCache;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class FilterParametersTest {

    public static final String ORGANISM_PART = "ORGANISM_PART";
    public static final String CELL_LINE = "CELL_LINE";
    private static final String EXPERIMENT_ACCESSION = "E-GEKO";

    private FilterParameters subject;

    @Mock
    ExperimentsCache experimentCacheMock;

    @Mock
    Experiment experimentMock;

    @Mock
    ExperimentalFactors experimentalFactorsMock;

    @Mock
    SolrClient solrClientMock;

    @Before
    public void initSubject() {

        when(experimentalFactorsMock.getFactorName(anyString())).thenReturn("X");
        when(experimentMock.getExperimentalFactors()).thenReturn(experimentalFactorsMock);

        FilterParameters.Builder builder = new FilterParameters.Builder();

        subject = builder.forExperiment(experimentMock)
                .withFilterFactors(Sets.newHashSet("A:B", "C:D"))
                .build();

    }

    @Test
    public void formatForDisplayShouldReplaceUnderscoresWithSpacesAndCapitilizeFirstLetter() {
        assertThat(subject.formatForDisplay(ORGANISM_PART), is("Organism part"));
        assertThat(subject.formatForDisplay(CELL_LINE), is("Cell line"));
    }

}
