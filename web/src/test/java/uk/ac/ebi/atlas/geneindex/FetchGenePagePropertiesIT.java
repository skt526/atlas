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
import org.hamcrest.Matchers;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import javax.inject.Inject;

import static org.junit.Assert.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = "classpath:applicationContext.xml")
public class FetchGenePagePropertiesIT {

    @Inject
    private SolrClient subject;


    @Test
    public void testFetchTooltipProperties() throws Exception {

        // given
        Multimap<String, String> properties = subject.fetchGenePageProperties("ENSMUSG00000029816");

        // index.types.genepage=synonym,ortholog,goterm,interproterm,ensfamily_description,ensgene,mgi_description,entrezgene,uniprot,mgi_id,gene_biotype,designelement_accession

        assertThat(properties.size(), Matchers.is(53));
        assertThat(properties.get("synonym").size(), Matchers.is(2));
        assertThat(properties.get("synonym"), Matchers.hasItems("Dchil", "Osteoactivin"));
        assertThat(properties.get("ortholog"), Matchers.hasItems("ENSRNOG00000008816", "ENSGALG00000010949", "ENSBTAG00000000604", "ENSXETG00000007393", "ENSG00000136235"));
        assertThat(properties.get("goterm"), Matchers.hasItems("heparin binding", "cell adhesion", "integral to plasma membrane", "cytoplasmic membrane-bounded vesicle"));
        assertThat(properties.get("interproterm"), Matchers.hasItems("PKD domain", "PKD/Chitinase domain"));
        assertThat(properties.get("ensfamily_description"), Matchers.hasItems("TRANSMEMBRANE GLYCOPROTEIN NMB PRECURSOR"));
        assertThat(properties.get("ensgene"), Matchers.hasItems("ENSMUSG00000029816"));
        assertThat(properties.get("mgi_description"), Matchers.hasItems("glycoprotein (transmembrane) nmb"));
        assertThat(properties.get("entrezgene"), Matchers.hasItems("93695"));
        assertThat(properties.get("uniprot"), Matchers.hasItems("Q99P91", "Q3UE75"));
        assertThat(properties.get("mgi_id"), Matchers.hasItems("MGI:1934765"));
        assertThat(properties.get("gene_biotype"), Matchers.hasItems("protein_coding"));
        assertThat(properties.get("designelement_accession"), Matchers.hasItems("5548029", "108822_at", "5610568", "5182097", "5246058"));
    }


}
