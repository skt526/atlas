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

package uk.ac.ebi.atlas.model.cache.baseline;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import uk.ac.ebi.atlas.commons.readers.TsvReader;
import uk.ac.ebi.atlas.commons.readers.TsvReaderBuilder;
import uk.ac.ebi.atlas.model.AssayGroups;
import uk.ac.ebi.atlas.model.ConfigurationTrader;
import uk.ac.ebi.atlas.model.baseline.BaselineExperimentBuilder;
import uk.ac.ebi.atlas.model.baseline.ExperimentRun;
import uk.ac.ebi.atlas.model.baseline.Factor;
import uk.ac.ebi.atlas.model.baseline.FactorGroup;

import java.util.HashSet;
import java.util.Set;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class BaselineExperimentsCacheLoaderTest {

    public static final String SPECIES = "species";
    public static final String DEFAULT_QUERY_FACTOR_TYPE = "defaultQueryFactorType";
    public static final String FACTOR_TYPE = "factorType";

    @Mock
    private ExperimentRun experimentRunMock1;

    @Mock
    private ExperimentRun experimentRunMock2;

    @Mock
    private FactorGroup factorGroupMock1;

    @Mock
    private FactorGroup factorGroupMock2;

    @Mock
    private Factor factorMock;

    @Mock
    private ConfigurationTrader configurationTraderMock;

    @Mock
    private TsvReader experimentDataTsvReaderMock;

    @Mock
    private TsvReaderBuilder tsvReaderBuilderMock;

    @Mock
    private AssayGroups assayGroupsMock;

    private BaselineExperimentsCacheLoader subject;

    private static String PATH_TEMPLATE_FAKE = "FAKE_PATH_TEMPLATE";

    @Before
    public void initSubject(){

        when(tsvReaderBuilderMock.forTsvFilePathTemplate(PATH_TEMPLATE_FAKE)).thenReturn(tsvReaderBuilderMock);
        when(tsvReaderBuilderMock.build()).thenReturn(experimentDataTsvReaderMock);

        subject =
                new BaselineExperimentsCacheLoader(tsvReaderBuilderMock, configurationTraderMock, PATH_TEMPLATE_FAKE){

                    @Override
                    protected BaselineExperimentBuilder createExperimentBuilder() {
                        throw new UnsupportedOperationException();
                    }
                };
    }


    @Test
    public void testGetRequiredFactorTypes() throws Exception {

        Set<Factor> defaultFilterFactors = new HashSet<>();

        Set<String> requiredFactorTypes = subject.getRequiredFactorTypes(DEFAULT_QUERY_FACTOR_TYPE, defaultFilterFactors);
        assertThat(requiredFactorTypes, contains(DEFAULT_QUERY_FACTOR_TYPE));

        when(factorMock.getType()).thenReturn(FACTOR_TYPE);
        defaultFilterFactors.add(factorMock);
        requiredFactorTypes = subject.getRequiredFactorTypes(DEFAULT_QUERY_FACTOR_TYPE, defaultFilterFactors);
        assertThat(requiredFactorTypes, containsInAnyOrder(DEFAULT_QUERY_FACTOR_TYPE, FACTOR_TYPE));
    }


}