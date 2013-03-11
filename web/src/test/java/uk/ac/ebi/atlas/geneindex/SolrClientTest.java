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

package uk.ac.ebi.atlas.geneindex;

import com.google.common.collect.Lists;
import org.junit.Before;
import org.junit.Test;
import org.springframework.web.client.RestTemplate;
import uk.ac.ebi.atlas.utils.Files;

import java.io.IOException;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.mock;

public class SolrClientTest {

    private SolrClient subject;

    @Before
    public void initSubject() {
        subject = new SolrClient(mock(RestTemplate.class), mock(SolrQueryService.class));
    }

    @Test
    public void toUppercaseShouldConvertAllStringsToUppercase(){
        assertThat(subject.toUppercase(Lists.newArrayList("hEllo", "bOy")),containsInAnyOrder("HELLO", "BOY"));
    }

    @Test
    public void testBuildQueryAllTextString() {
        String query = "GO:0008134 \"p53 binding\"";
        assertThat(subject.buildQueryAllTextString(query), is("(alltext:GO\\:0008134 \"p53 binding\")"));

        query = "GO:0008134 \"p53 binding";
        assertThat(subject.buildQueryAllTextString(query), is("(alltext:GO\\:0008134 \"p53 binding\")"));
    }

    @Test
    public void testExtractSuggestion(){
        //given
        String suggestion = subject.extractSuggestion("autocomplete_genename:\"musk\" AND species:\"mus musculus\"");

        assertThat(suggestion, is("musk"));

    }


}