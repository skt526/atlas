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

package uk.ac.ebi.atlas.geneindex;

import com.google.common.collect.Multimap;
import org.apache.solr.client.solrj.SolrServerException;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import javax.inject.Inject;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = "classpath:applicationContext.xml")
public class SolrQueryServiceIT {

    @Inject
    private SolrQueryService subject;

    @Test
    public void testGetSolrResultsForQuery() throws SolrServerException {

        // given
        String queryString = subject.buildGeneQuery("aspm", false, "homo sapiens");
        List<String> geneNames = subject.getSolrResultsForQuery(queryString, "property", 100);

        // then
        assertThat(geneNames, contains("ASPM"));

    }

    @Test
    public void testGetSolrResultsForMultiTermQuery() throws SolrServerException {

        // given
        String queryString = subject.buildGeneQuery("aspm splicing", false, "homo sapiens");
        List<String> geneNames = subject.getSolrResultsForQuery(queryString, "property", 100);

        // then
        assertThat(geneNames, hasItems("ASPM", "RNA splicing", "mRNA splicing, via spliceosome", "RNA splicing, via transesterification reactions"));

    }

    @Test
    public void testQuerySolrForProperties() throws SolrServerException {

        // given
        String queryString = subject.buildCompositeQueryIdentifier("ENSG00000109819", new String[]{"goterm"});
        Multimap<String, String> multimap = subject.querySolrForProperties(queryString, 100);

        // then
        assertThat(multimap.get("goterm"), hasItems("RNA splicing", "cellular response to oxidative stress", "cellular glucose homeostasis"));

    }

    @Test
    public void testFetchGeneIdentifiersFromSolr() throws SolrServerException {

        // given
        String queryString = subject.buildGeneQuery("aspm", false, "homo sapiens");
        List<String> geneIds = subject.fetchGeneIdentifiersFromSolr(queryString);

        // then
        assertThat(geneIds.size(), is(1));
        assertThat(geneIds, hasItem("ENSG00000066279"));

    }

    @Test
    public void testFetchGeneIdentifiersFromSolrMany() throws SolrServerException {

        // given
        String queryString = subject.buildGeneQuery("protein", false, "homo sapiens");
        List<String> geneIds = subject.fetchGeneIdentifiersFromSolr(queryString);

        // then
        assertThat(geneIds.size(), is(25375));
        assertThat(geneIds, hasItems("ENSG00000179218", "ENSG00000269773"));

    }

    @Test
    public void testGetSpeciesForIdentifier() throws SolrServerException {

        assertThat(subject.getSpeciesForIdentifier("ENSG00000179218"), is("homo sapiens"));
        assertThat(subject.getSpeciesForIdentifier("ENSMUSG00000029816"), is("mus musculus"));

    }

}