package uk.ac.ebi.atlas.experimentimport.experimentdesign.magetab;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import uk.ac.ebi.atlas.model.ExperimentDesign;
import uk.ac.ebi.atlas.model.baseline.Factor;
import uk.ac.ebi.atlas.model.baseline.impl.FactorSet;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.Iterator;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.collection.IsIterableContainingInOrder.contains;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = {"classpath:applicationContext.xml", "classpath:solrContextIT.xml", "classpath:oracleContext.xml"})
public class MageTabParserIT {

    private static final String EXPERIMENT_WITH_FACTOR_TYPE_DIFFERENT_FROM_NAME = "E-TABM-713";
    private static final String EXPERIMENT_WITH_COMPOUND_FACTOR_TYPE_DIFFERENT_FROM_NAME = "E-GEOD-10732";

    @Resource(name = "microarrayExperimentMageTabParser")
    private MicroarrayExperimentMageTabParser subject;

    @Test
    public void factorIsDescribedByFactorTypeAndNotName() throws IOException {
        ExperimentDesign experimentDesign = subject.parse(EXPERIMENT_WITH_FACTOR_TYPE_DIFFERENT_FROM_NAME).getExperimentDesign();

        assertThat(experimentDesign.getSampleHeaders(), contains("DiseaseState", "Organism", "organism part"));
        assertThat(experimentDesign.getFactorHeaders(), contains("disease state"));


        FactorSet factors = experimentDesign.getFactors("Hybridization 1");
        Factor factor1 = factors.iterator().next();
        assertThat(factor1.getHeader(), is("disease state"));
        assertThat(factor1.getType(), is("DISEASE_STATE"));
    }

    @Test
    public void compoundFactorIsDescribedByFactorTypeAndNotName() throws IOException {
        ExperimentDesign experimentDesign = subject.parse(EXPERIMENT_WITH_COMPOUND_FACTOR_TYPE_DIFFERENT_FROM_NAME).getExperimentDesign();

        assertThat(experimentDesign.getFactorHeaders(), contains("compound", "genotype"));

        FactorSet factors = experimentDesign.getFactors("Arabidopsis plant (Col-0), 4h_control_rep1");
        Iterator<Factor> iterator = factors.iterator();
        Factor factor1 = iterator.next();
        Factor factor2 = iterator.next();
        assertThat(factor1.getHeader(), is("genotype"));
        assertThat(factor1.getType(), is("GENOTYPE"));
        assertThat(factor2.getHeader(), is("compound"));
        assertThat(factor2.getType(), is("COMPOUND"));
        assertThat(iterator.hasNext(), is(false));
    }

}
