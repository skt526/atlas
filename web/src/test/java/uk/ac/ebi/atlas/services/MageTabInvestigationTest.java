package uk.ac.ebi.atlas.services;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import uk.ac.ebi.arrayexpress2.magetab.datamodel.MAGETABInvestigation;
import uk.ac.ebi.arrayexpress2.magetab.exception.ParseException;
import uk.ac.ebi.arrayexpress2.magetab.parser.MAGETABParser;

import java.io.InputStream;
import java.net.URL;

import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class MageTabInvestigationTest {

    private MageTabInvestigation subject;

    private URL urlFake;

    @Mock
    private InputStream inputStreamMock;

    @Mock
    private MAGETABParser MAGETABParserMock;

    @Mock
    private MAGETABInvestigation investigationMock;

    @Before
    public void initMAGETABParserMock() throws Exception {
        urlFake = new URL("file://fakeURL");
        when(MAGETABParserMock.parse(inputStreamMock)).thenReturn(investigationMock);
    }


    @Before
    public void initSubject() throws Exception {
        subject = new MageTabInvestigation(MAGETABParserMock);
    }

    @Test
    public void parseInvestigationShouldUseMAGETABParser() throws Exception {
        //given
        subject.parseInvestigation(urlFake) ;
         //then
        verify(MAGETABParserMock).parse(urlFake);
    }


    @Test(expected = IllegalStateException.class)
    public void parseInvestigationShouldThrowIllegalStateExceptionOnMAGETABParserErrors() throws Exception {
        //given
        given(MAGETABParserMock.parse(urlFake)).willThrow(new ParseException());
        //when
        subject.parseInvestigation(urlFake) ;
        //then expect IllegalStateException
    }

    //The other methods can't be unit tested becouse they depend on limpopo APIs that are not testable nor can be stubbed,
    //because they expose public instance attributes (often even final) and not public methods, and they require clients to use static utility methods.
}
