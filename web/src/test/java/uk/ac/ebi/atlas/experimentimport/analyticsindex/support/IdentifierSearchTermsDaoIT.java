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

package uk.ac.ebi.atlas.experimentimport.analyticsindex.support;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import javax.inject.Inject;
import java.util.Set;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = {"classpath:applicationContext.xml", "classpath:solrContextIT.xml", "classpath:oracleContext.xml"})
public class IdentifierSearchTermsDaoIT {

    @Inject
    private IdentifierSearchTermsDAO subject;

    @Test
    public void fetchSearchTerms() {
        Set<String> properties = subject.fetchSearchTerms("ENSMODG00000012671");

        assertThat(properties.size(), is(39));
        //System.out.println("\"" + Joiner.on("\", \"").join(properties) + "\"");
        assertThat(properties, containsInAnyOrder("regulation of meiotic cell cycle", "oogenesis", "developmental growth", "microtubule", "negative regulation of asymmetric cell division", "ASP", "IQ motif, EF-hand binding site", "neuron migration", "Calmbp1", "FLJ10549", "Calponin homology domain", "forebrain neuroblast division", "calmodulin binding", "F6VH23", "cytoplasm", "mitotic spindle pole", "ASPM", "positive regulation of neuroblast proliferation", "spindle pole", "positive regulation of canonical Wnt signaling pathway", "neuronal stem cell maintenance", "P-loop containing nucleoside triphosphate hydrolase", "maintenance of centrosome location", "male gonad development", "protein_coding", "asp (abnormal spindle) homolog, microcephaly associated (Drosophila) [Source:HGNC Symbol;Acc:HGNC:19048]", "negative regulation of neuron differentiation", "protein binding", "MCPH5", "Calmodulin-regulated spectrin-associated protein, CH domain", "FLJ10517", "binding", "spermatogenesis", "brain development", "cerebral cortex development", "spindle assembly involved in meiosis", "midbody", "Armadillo-type fold", "meiotic spindle"));

        //assertThat(properties.get("synonym").size(), is(5));
        //assertThat(properties.get("synonym"), hasItems("Calmbp1", "MCPH5", "ASP"));
        //assertThat(properties.get("goterm"), hasItems("oogenesis", "developmental growth", "positive regulation of neuroblast proliferation"));
        //assertThat(properties.get("interproterm"), hasItems("Calmodulin-regulated spectrin-associated protein, CH domain", "Armadillo-type fold", "IQ motif, EF-hand binding site"));
    }

    @Test
    public void fetchSearchTermsForUnknownGene()  {
        Set<String> properties = subject.fetchSearchTerms("FOOBAR");

        assertThat(properties.size(), is(0));
    }

}
