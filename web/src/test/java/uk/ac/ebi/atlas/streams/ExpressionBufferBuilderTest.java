package uk.ac.ebi.atlas.streams;

import com.google.common.collect.Lists;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import uk.ac.ebi.atlas.model.Experiment;
import uk.ac.ebi.atlas.model.ExperimentRun;
import uk.ac.ebi.atlas.model.caches.ExperimentsCache;

import java.util.Comparator;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ExpressionBufferBuilderTest {

    private static final String RUN_ACCESSION_1 = "ENS0";
    private static final String RUN_ACCESSION_2 = "ENS1";
    private static final String RUN_ACCESSION_3 = "ENS2";

    private ExperimentRun experimentRun1;
    private ExperimentRun experimentRun2;
    private ExperimentRun experimentRun3;

    private static final String MOCK_EXPERIMENT_ACCESSION = "MOCK_EXPERIMENT_ACCESSION";

    @Mock
    private ExperimentsCache experimentsCacheMock;

    private ExpressionsBuffer.Builder subject;

    @Before
    public void initializeSubject() {
        experimentRun1 = new ExperimentRun(RUN_ACCESSION_1).addFactorValue("ORGANISM_PART", "ORGANISM_PART", "heart");
        experimentRun2 = new ExperimentRun(RUN_ACCESSION_2).addFactorValue("ORGANISM_PART", "ORGANISM_PART", "liver");
        experimentRun3 = new ExperimentRun(RUN_ACCESSION_3).addFactorValue("ORGANISM_PART", "ORGANISM_PART", "lung");

        Experiment experiment = new Experiment(MOCK_EXPERIMENT_ACCESSION)
                .addAll(Lists.newArrayList(experimentRun1, experimentRun2, experimentRun3));

        when(experimentsCacheMock.getExperiment(MOCK_EXPERIMENT_ACCESSION)).thenReturn(experiment);

        subject = new ExpressionsBuffer.Builder(experimentsCacheMock);
    }

    @Test
    public void builderShouldFetchExperimentRunsFromACache(){

        //when
        subject.forExperiment(MOCK_EXPERIMENT_ACCESSION);
        subject.withHeaders("G1","ENS1","ENS2");
        //then
        verify(experimentsCacheMock,times(2)).getExperiment(MOCK_EXPERIMENT_ACCESSION);

    }

    @Test(expected = IllegalStateException.class)
    public void createThrowsExceptionGivenThatExperimentAccessionHasNotBeenProvided() {
        //when
        subject.create();
    }

    @Test(expected = IllegalStateException.class)
    public void createThrowsExceptionGivenThatOrderedHeadersHaveNotBeenProvided() {
        //when
        subject.create();
    }

    @Test(expected = IllegalStateException.class)
    public void withHeadersThrowsExceptionWhenExperimentAccessionIsNotSet() {
        //when
        subject.create();
    }

    @Test
    public void createShouldSucceedWhenSpecificationHasBeenSet() {
        //given
        String[] headers = new String[]{"", RUN_ACCESSION_2, RUN_ACCESSION_3};
        //when
        subject.forExperiment(MOCK_EXPERIMENT_ACCESSION);
        //then
        assertThat(subject.withHeaders(headers).create(), is(notNullValue()));
    }

    @Test
    public void experimentRunIsRequiredWhenItsAccessionIsIncludedInTheProvidedOrderedRunAccessions() {
        //given
        List<String> orderSpecification = Lists.newArrayList(RUN_ACCESSION_2, RUN_ACCESSION_3);
        //when
        boolean isRequired = subject.isExperimentRunRequired(orderSpecification).apply(experimentRun2);
        //then
        assertThat(isRequired, is(true));
    }

    @Test
    public void experimentRunIsNotRequiredWhenItsAccessionIsNotIncludedInTheProvidedOrderedRunAccessions() {
        //given
        List<String> orderSpecification = Lists.newArrayList(RUN_ACCESSION_2, RUN_ACCESSION_3);
        //when
        boolean isRequired = subject.isExperimentRunRequired(orderSpecification).apply(experimentRun1);
        //then
        assertThat(isRequired, is(false));
    }

    @Test(expected = IllegalStateException.class)
    public void experimentRunComparatorThrowsExceptionWhenExperimentRunAccessionIsNotInTheOrderedListOfKnownAccessions() {
        //given
        List<String> orderedRunAccessions = Lists.newArrayList(RUN_ACCESSION_2, RUN_ACCESSION_3);
        //and
        Comparator<ExperimentRun> experimentRunsComparator = subject.experimentRunComparator(orderedRunAccessions);
        //when
        experimentRunsComparator.compare(experimentRun2, experimentRun1);
        //then expect IllegalStateExceptionToBeThrown;
    }

    @Test
    public void experimentRunComparatorShouldOrderByPositionInTheListOfOrderedRunAccessions() {
        //given
        List<String> orderSpecification = Lists.newArrayList(RUN_ACCESSION_3, RUN_ACCESSION_2);
        //and
        Comparator<ExperimentRun> experimentRunsComparator = subject.experimentRunComparator(orderSpecification);
        //then
        assertThat(experimentRunsComparator.compare(experimentRun2, experimentRun3), is(greaterThan(0)));
        //and
        assertThat(experimentRunsComparator.compare(experimentRun3, experimentRun2), is(lessThan(0)));

    }

}
