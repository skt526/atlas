package uk.ac.ebi.atlas.services;

import org.hamcrest.Matchers;
import org.junit.Before;
import org.junit.Test;
import uk.ac.ebi.atlas.model.ExperimentRun;
import uk.ac.ebi.atlas.model.ExpressionLevel;
import utils.ExperimentRunsBuilder;

import java.util.*;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.Assert.assertThat;

public class ExpressionLevelBufferTest {

    private static final String RUN_ACCESSION1 = "ERR030872";
    private static final String RUN_ACCESSION2 = "ERR030873";
    private static final String RUN_ACCESSION3 = "ERR030874";
    private static final String TRANSCRIPT_ID = "ENST00000000233";
    private static final String[] RPKM_VALUES = new String[]{TRANSCRIPT_ID, "0", "42.9134", "0.0001"};

    private ExpressionLevelsBuffer subject;
    private static List<ExperimentRun> EXPERIMENT_RUNS;

    @Before
    public void initializeSubject() {
        String[] orderedRunAccessions = new String[] {RUN_ACCESSION1,
            RUN_ACCESSION2, RUN_ACCESSION3};

        EXPERIMENT_RUNS = new ExperimentRunsBuilder().buildExperimentRuns(RUN_ACCESSION1,
            RUN_ACCESSION2, RUN_ACCESSION3);
        subject = new ExpressionLevelsBuffer(EXPERIMENT_RUNS);
    }

    @Test
    public void pollShouldReturnExpressionLevelsInTheRightOrder() throws Exception {
        subject.reload(RPKM_VALUES);
        //given the object was just initialized
        ExpressionLevel expressionLevel = subject.poll();
        //then we expect first expressionLevel
        assertThat(expressionLevel.getTranscriptId(), is(TRANSCRIPT_ID));
        assertThat(expressionLevel.getRpkm(), is(0d));
        assertThat(expressionLevel.getFactorValues(), is(EXPERIMENT_RUNS.get(0).getFactorValues()));

        //given we poll again
        expressionLevel = subject.poll();
        //then we expect secondExpressionLevel
        assertThat(expressionLevel.getTranscriptId(), is(TRANSCRIPT_ID));
        assertThat(expressionLevel.getRpkm(), is(42.9134d));
        assertThat(expressionLevel.getFactorValues(), is(EXPERIMENT_RUNS.get(1).getFactorValues()));

    }

    @Test
    public void bufferShouldBeExhaustedAfterThreePolls() throws Exception {
        //given we do first reload
        subject.reload(RPKM_VALUES);
        //and we poll three times
        subject.poll();
        subject.poll();
        subject.poll();
        //then we expect next poll to return null
        assertThat(subject.poll(), Matchers.is(nullValue()));
    }

    @Test
    public void reloadWhenBufferIsExhaustedShouldFillTheBufferAgain() throws Exception {
        //given we do first reload
        subject.reload(RPKM_VALUES);
        //and we poll until exhaustion
        ExpressionLevel run;
        do{
            run = subject.poll();
        } while (run != null);
        //when we reload again with new values
        subject.reload("T1", "1", "2", "3");
        //and we poll
        ExpressionLevel expressionLevel = subject.poll();
        //then we expect to find the new values
        assertThat(expressionLevel.getTranscriptId(), is("T1"));
        assertThat(expressionLevel.getRpkm(), is(1d));
        assertThat(expressionLevel.getRunAccession(), is(EXPERIMENT_RUNS.get(0).getRunAccession()));
    }


    @Test(expected = IllegalArgumentException.class)
    public void reloadShouldThrowExceptionIfMoreValuesThanRuns() throws Exception {
        //given that we initialized subject with three runs
        //when
        subject.reload(TRANSCRIPT_ID, "0", "42.9134", "0.0001", "666");

    }

    @Test(expected = IllegalArgumentException.class)
    public void reloadShouldThrowExceptionIfLessValuesThanRuns() throws Exception {
        //given that we initialized subject with three runs
        //when
        subject.reload(TRANSCRIPT_ID, "0", "42.9134");

    }

    @Test(expected = IllegalArgumentException.class)
    public void reloadShouldThrowIfBufferIsNotEmpty() throws Exception {
        //given
        subject.reload(TRANSCRIPT_ID, "0", "42.9134");
        //and
        subject.poll();
        //when we reload again
        subject.reload(TRANSCRIPT_ID, "0", "42.9134");

    }


}
