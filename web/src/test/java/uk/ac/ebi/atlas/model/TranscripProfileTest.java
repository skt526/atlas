package uk.ac.ebi.atlas.model;

import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;

public class TranscripProfileTest {

    private GeneProfile subject;

    Expression expression = new Expression(new ExperimentRun("RUN_ACCESSION_1"), 2.2D);

    @Before
    public void setUp() throws Exception {
        subject = GeneProfile.forGeneId("EMBL-1")
                .addExpression(expression).create();
    }

    @Test
    public void testGetGeneSpecificity() throws Exception {
        assertThat(subject.getGeneSpecificity(), is(1));
    }

    @Test
    public void testIterator() throws Exception {
        assertThat(subject.iterator().next(), is(notNullValue()));
    }

    @Test
    public void builderAddExpressionTest() {
        GeneProfile.Builder builder = GeneProfile.forGeneId("ENS1");
        builder.withCutoff(3d);

        Expression expressionSmaller = new Expression(new ExperimentRun("RUN_ACCESSION_1"), 2.2D);
        builder.addExpression(expressionSmaller);

        assertThat(builder.containsExpressions(), is(false));

        Expression expressionEquals = new Expression(new ExperimentRun("RUN_ACCESSION_1"), 3D);
        builder.addExpression(expressionEquals);

        assertThat(builder.containsExpressions(), is(false));

        Expression expressionBigger = new Expression(new ExperimentRun("RUN_ACCESSION_1"), 4D);
        builder.addExpression(expressionBigger);

        assertThat(builder.containsExpressions(), is(true));

    }
}

