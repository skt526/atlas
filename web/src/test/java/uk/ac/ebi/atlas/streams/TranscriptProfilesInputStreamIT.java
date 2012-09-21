package uk.ac.ebi.atlas.streams;

import com.google.common.collect.Lists;
import org.junit.Before;
import org.junit.Test;
import uk.ac.ebi.atlas.model.ExperimentRun;
import uk.ac.ebi.atlas.model.TranscriptProfile;
import utils.ExperimentRunsBuilder;

import java.io.IOException;
import java.net.URL;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class TranscriptProfilesInputStreamIT {

    private static final String RUN_ACCESSION_1 = "ERR030872";
    private static final String RUN_ACCESSION_2 = "ERR030873";
    private static final String RUN_ACCESSION_3 = "ERR030874";
    private static final String TRANSCRIPT_ID_1 = "ENST00000000233";
    private static final String TRANSCRIPT_ID_2 = "ENST00000000412";
    private static final String TRANSCRIPT_ID_3 = "ENST00000000442";
    private static final double EXPRESSION_LEVEL_1_1 = 0d;
    private static final double EXPRESSION_LEVEL_1_2 = 42.9134d;
    private static final double EXPRESSION_LEVEL_2_1 = 29.0613d;

    private List<ExperimentRun> experimentRuns;

    private URL dataFileURL;

    private TranscriptProfilesInputStream subject;

    @Before
    public void initSubject() throws Exception {

        dataFileURL = TranscriptProfilesInputStreamIT.class.getResource("testCSVReader-data.tab");

        ExperimentRun experimentRun1 = ExperimentRunsBuilder.forRunAccession(RUN_ACCESSION_1).create();
        ExperimentRun experimentRun2 = ExperimentRunsBuilder.forRunAccession(RUN_ACCESSION_2).create();
        ExperimentRun experimentRun3 = ExperimentRunsBuilder.forRunAccession(RUN_ACCESSION_3).create();

        experimentRuns = Lists.newArrayList(experimentRun2, experimentRun3, experimentRun1);

        subject = TranscriptProfilesInputStream.forInputStream(dataFileURL.openStream())
                        .withExperimentRuns(experimentRuns)
                        .create();

    }

    @Test
    public void readNextShouldReturnNextExpression() throws IOException {
        //given
        TranscriptProfile transcriptProfile = subject.readNext();
        //then
        assertThat(transcriptProfile.getTranscriptId(), is(TRANSCRIPT_ID_1));
        assertThat(transcriptProfile.getTranscriptSpecificity(), is(1));
        assertThat(transcriptProfile.iterator().hasNext(), is(true));
        //ToDo: TranscriptProfile needs a getter for Expressions

        //given we poll twice more
        transcriptProfile = subject.readNext();
        //then
        assertThat(transcriptProfile.getTranscriptId(), is(TRANSCRIPT_ID_2));
        assertThat(transcriptProfile.getTranscriptSpecificity(), is(3));

        transcriptProfile = subject.readNext();

        assertThat(transcriptProfile.getTranscriptId(), is(TRANSCRIPT_ID_3));
        assertThat(transcriptProfile.getTranscriptSpecificity(), is(2));
    }


    @Test
    public void readNextShouldReturnNullGivenAllExpressionLevelsHaveBeenRead() throws Exception {
        TranscriptProfile transcriptProfile;

        for (int i = 0; i < 3; i++) {
            //given
            transcriptProfile = subject.readNext();
            //then
            assertThat(transcriptProfile, is(notNullValue()));
        }
        //given
        transcriptProfile = subject.readNext();
        //then
        assertThat(transcriptProfile, is(nullValue()));
    }

    @Test
    public void setCutoffChangesSpecificity() throws IOException {

        //given
        subject = TranscriptProfilesInputStream.forInputStream(dataFileURL.openStream())
            .withExperimentRuns(experimentRuns).withCutoff(20D)
            .create();

        //when
        subject.readNext();
        TranscriptProfile transcriptProfile = subject.readNext();

        //then specificity of second transcript should change
        assertThat(transcriptProfile.getTranscriptSpecificity(), is(2));

        //then third transcript is not created since it has no expressions higher than cutoff.
        assertThat(subject.readNext(), is(nullValue()));

    }

    @Test(expected = IllegalStateException.class)
    public void givenTheReaderHasBeenClosedReadNextShouldThrowIllegalStateException() throws Exception {
        //given
        subject.close();
        //when
        subject.readNext();
    }


    @Test
    public void closingTwiceShouldNotThrowException() throws Exception {
        //given
        subject.close();
        //when
        subject.close();
    }

}
