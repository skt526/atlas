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

package uk.ac.ebi.atlas.solr.admin.index;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

@RunWith(SpringJUnit4ClassRunner.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@WebAppConfiguration
@ContextConfiguration(locations = {"classpath:applicationContext.xml", "classpath:solrContextIT.xml"})//Embedded.xml"})
public class BioentityIndexIT {

    /*@Value("#{configuration['bioentity.properties']}")
    private String bioentityPropertyDirectory;

    @Inject
    private BioentityIndex subject;

    private static SolrServer embeddedSolrServer;

    @Inject
    public void setEmbeddedSolrServer(EmbeddedSolrServer embeddedSolrServer) {
        BioentityIndexIT.embeddedSolrServer = embeddedSolrServer;
    }

    @Before
    public void setup() throws ParserConfigurationException, SAXException, IOException {
    }

    @After
    public void cleanupData() throws IOException, SolrServerException {
        subject.deleteAll();
    }

    @AfterClass
    public static void shutdown() {
        embeddedSolrServer.shutdown();
    }*/

    @Test
    public void removeMe() {

    }

    // TODO: enable test again
    /*public void indexFileShouldSucceed() throws IOException, SolrServerException {
        subject.indexFile(Paths.get(bioentityPropertyDirectory, "anopheles_gambiae.A-AFFY-102.tsv"));

        SolrParams solrQuery = new SolrQuery("*:*");
        QueryResponse queryResponse = embeddedSolrServer.query(solrQuery);
        List<BioentityProperty> bioentityProperties = queryResponse.getBeans(BioentityProperty.class);
        assertThat(bioentityProperties, hasSize(10));

    }

    // TODO: enable test again
    public void addBioentityPropertiesShouldSucceed() throws IOException, SolrServerException, InterruptedException {
        subject.indexFile(Paths.get(bioentityPropertyDirectory, "anopheles_gambiae.ensgene.tsv"));

        SolrParams solrQuery = new SolrQuery("*:*").setRows(10000);
        QueryResponse queryResponse = embeddedSolrServer.query(solrQuery);
        List<BioentityProperty> bioentityProperties = queryResponse.getBeans(BioentityProperty.class);
        assertThat(bioentityProperties, hasSize(315));

    }*/
}
