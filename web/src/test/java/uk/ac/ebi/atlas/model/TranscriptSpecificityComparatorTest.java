package uk.ac.ebi.atlas.model;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.lessThan;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TranscriptSpecificityComparatorTest {

    private TranscriptSpecificityComparator subject;

    @Mock
    private TranscriptExpression nullTranscriptSpecificity;

    @Mock
    private TranscriptExpression transcriptWithSpecificity1;

    @Mock
    private TranscriptExpression transcriptWithSpecificity16;

    @Mock
    private TranscriptExpression transcriptWithSpecificity16AndSmallerExpressionLevel;


    @Before
    public void initTranscriptExpressions() {
        when(nullTranscriptSpecificity.getSpecificity()).thenReturn(null);
        when(transcriptWithSpecificity1.getSpecificity()).thenReturn(1);
        when(transcriptWithSpecificity16.getSpecificity()).thenReturn(16);
        when(transcriptWithSpecificity16.getLevel()).thenReturn(10D);
        when(transcriptWithSpecificity16AndSmallerExpressionLevel.getSpecificity()).thenReturn(16);
        when(transcriptWithSpecificity16AndSmallerExpressionLevel.getLevel()).thenReturn(0D);
        subject = new TranscriptSpecificityComparator();
    }

    @Before
    public void initSubject() {
        subject = new TranscriptSpecificityComparator();
    }

    @Test
    public void nullSpecificityShouldFollowLowerSpecificity() {
        //when
        int comparison = subject.compare(nullTranscriptSpecificity, transcriptWithSpecificity16);

        //then
        assertThat(comparison, is(lessThan(0)));

    }

    @Test
    public void lowSpecificityShouldFollowHigherSpecificity() {
        //when
        int comparison = subject.compare(transcriptWithSpecificity16, transcriptWithSpecificity1);

        //then
        assertThat(comparison, is(lessThan(0)));

    }

    @Test
    public void highSpecificityShouldPreceedLowSpecificity() {
        //when
        int comparison = subject.compare(transcriptWithSpecificity1, transcriptWithSpecificity16);

        //then
        assertThat(comparison, is(greaterThan(0)));

    }

    @Test
    public void differentSpecificityShouldNotTriggerExpressionComparator() {
        //when
        int comparison = subject.compare(transcriptWithSpecificity1, transcriptWithSpecificity16);

        //then
        verify(transcriptWithSpecificity16AndSmallerExpressionLevel, never()).compareTo(transcriptWithSpecificity16);

    }

    @Test
    public void sameSpecificityWithSmallerExpressionLevelShouldFollow() {
        //when
        int comparison = subject.compare(transcriptWithSpecificity16AndSmallerExpressionLevel, transcriptWithSpecificity16);

        //then
        verify(transcriptWithSpecificity16AndSmallerExpressionLevel).compareTo(transcriptWithSpecificity16);

    }


}
