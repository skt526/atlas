
package uk.ac.ebi.atlas.web;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import uk.ac.ebi.atlas.model.AnatomogramType;
import uk.ac.ebi.atlas.model.baseline.BaselineExperiment;
import uk.ac.ebi.atlas.trader.ArrayDesignTrader;
import uk.ac.ebi.atlas.trader.cache.RnaSeqBaselineExperimentsCache;

import javax.servlet.http.HttpServletRequest;
import java.util.Properties;

import static org.hamcrest.CoreMatchers.nullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class ApplicationPropertiesTest {
    private static final String HOMO_SAPIENS_SPECIES = "homo sapiens";
    private static final String MOUSE_SPECIES = "mousy";
    private static final String RAT_SPECIES = "rattus";

    private static final String HOMO_SAPIENS_MALE_FILE_NAME = "homoSapiensMale";
    private static final String HOMO_SAPIENS_FEMALE_FILE_NAME = "homoSapiensFemale";
    private static final String MOUSE_MALE_FILE_NAME = "mouseMale";
    private static final String MOUSE_FEMALE_FILE_NAME = "mouseFemale";
    private static final String RAT_FILE_NAME = "rat";

    private static final String ORGANISM_PARTS_PROPERTY_KEY = "organism.parts";
    private static final String ANATOMOGRAM_PROPERTY_KEY = "organism.anatomogram.";
    private static final String FEEDBACK_EMAIL_PROPERTY_KEY = "feedback.email";
    private static final String FEEDBACK_EMAIL_VALUE = "abc@abc.com";
    private static final String ARRAYEXPRESS_URL = "https://www.ebi.ac.uk/arrayexpress/";
    private static final String EXPERIMENT_ARRAYEXPRESS_URL_TEMPLATE = "experiment.arrayexpress.url.template";
    private static final String EXPERIMENT_ACCESSION = "EXPERIMENT_ACCESSION";
    private static final String ARRAYEXPRESS_REST_URL = "https://www.ebi.ac.uk/arrayexpressrest/";
    private static final String EXPERIMENT_ARRAYEXPRESS_REST_URL_TEMPLATE = "experiment.arrayexpress.rest.url.template";
    private static final String LIST_SEPARATOR = ",";
    private static final String A_AFFY_35 = "A-AFFY-35";
    private static final String A_AFFY_35_NAME = "A-AFFY-35-NAME";
    private static final String EXPERIMENT_ARRAYEXPRESS_ARRAYS_URL_TEMPLATE = "experiment.arrayexpress.arrays.url.template";
    private static final String ARRAYEXPRESS_ARRAYS_URL = "https://www.ebi.ac.uk/arrayexpress/arrays/";
    private static final String EXPERIMENT_PUBMED_URL_TEMPLATE = "experiment.pubmed.url.template";
    private static final String PUBMED_URL = "https://europepmc.org/abstract/MED/";
    private static final String EXPERIMENT_ATLAS_URL_TEMPLATE = "experiment.atlas.url.template";
    private static final String ATLAS_URL = "https://www-test.ebi.ac.uk/gxa/experiments/";
    private static final String PUB_MED_ID = "123456";

    private static final String EXPERIMENT_URL = "http://x.y/z";
    private static final String REQUEST_PARAMETERS = "p1=1&p2=2";
    private static final String DOWNLOAD_URL = EXPERIMENT_URL + ".tsv?" + REQUEST_PARAMETERS;

    @Mock
    private HttpServletRequest httpServletRequestMock;

    @Mock
    private BaselineExperiment homoSapiensExperimentMock;

    @Mock
    private BaselineExperiment mouseExperimentMock;

    @Mock
    private RnaSeqBaselineExperimentsCache experimentCacheMock;

    @Mock
    private Properties configurationPropertiesMock;

    @Mock
    private Properties speciesToExperimentPropertiesMock;

    @Mock
    private ArrayDesignTrader arrayDesignTraderMock;

    private ApplicationProperties subject;

    @Before
    public void setUp() throws Exception {
        when(configurationPropertiesMock.getProperty(ORGANISM_PARTS_PROPERTY_KEY)).thenReturn("heart" + LIST_SEPARATOR + "wind" + LIST_SEPARATOR + "fire");
        when(configurationPropertiesMock.getProperty(ANATOMOGRAM_PROPERTY_KEY + HOMO_SAPIENS_SPECIES + ".male")).thenReturn(HOMO_SAPIENS_MALE_FILE_NAME);
        when(configurationPropertiesMock.getProperty(ANATOMOGRAM_PROPERTY_KEY + HOMO_SAPIENS_SPECIES + ".female")).thenReturn(HOMO_SAPIENS_FEMALE_FILE_NAME);
        when(configurationPropertiesMock.getProperty(ANATOMOGRAM_PROPERTY_KEY + MOUSE_SPECIES + ".male")).thenReturn(MOUSE_MALE_FILE_NAME);
        when(configurationPropertiesMock.getProperty(ANATOMOGRAM_PROPERTY_KEY + MOUSE_SPECIES + ".female")).thenReturn(MOUSE_FEMALE_FILE_NAME);
        when(configurationPropertiesMock.getProperty(ANATOMOGRAM_PROPERTY_KEY + RAT_SPECIES + ".male")).thenReturn(RAT_FILE_NAME);
        when(configurationPropertiesMock.getProperty(ANATOMOGRAM_PROPERTY_KEY + RAT_SPECIES + ".female")).thenReturn(null);

        when(configurationPropertiesMock.getProperty(EXPERIMENT_ARRAYEXPRESS_URL_TEMPLATE)).thenReturn(ARRAYEXPRESS_URL + "{0}");
        when(configurationPropertiesMock.getProperty(EXPERIMENT_ARRAYEXPRESS_REST_URL_TEMPLATE)).thenReturn(ARRAYEXPRESS_REST_URL + "{0}");
        when(configurationPropertiesMock.getProperty(FEEDBACK_EMAIL_PROPERTY_KEY)).thenReturn(FEEDBACK_EMAIL_VALUE);

        when(configurationPropertiesMock.getProperty(EXPERIMENT_ARRAYEXPRESS_ARRAYS_URL_TEMPLATE)).thenReturn(ARRAYEXPRESS_ARRAYS_URL + "{0}");
        when(configurationPropertiesMock.getProperty(EXPERIMENT_PUBMED_URL_TEMPLATE)).thenReturn(PUBMED_URL + "{0}");
        when(configurationPropertiesMock.getProperty(EXPERIMENT_ATLAS_URL_TEMPLATE)).thenReturn(ATLAS_URL + "{0}");

        when(homoSapiensExperimentMock.getSpeciesString()).thenReturn(HOMO_SAPIENS_SPECIES);
        when(mouseExperimentMock.getSpeciesString()).thenReturn(MOUSE_SPECIES);

        //given
        when(httpServletRequestMock.getAttribute("javax.servlet.forward.request_uri")).thenReturn(EXPERIMENT_URL);
        when(httpServletRequestMock.getAttribute("javax.servlet.forward.query_string")).thenReturn(REQUEST_PARAMETERS);

        when(arrayDesignTraderMock.getArrayDesignAccession(A_AFFY_35_NAME)).thenReturn(A_AFFY_35);

        subject = new ApplicationProperties(configurationPropertiesMock, speciesToExperimentPropertiesMock, arrayDesignTraderMock);
    }

    @Test
    public void testGetAnatomogramFileName() throws Exception {
        String fileNameMale = subject.getAnatomogramFileName(HOMO_SAPIENS_SPECIES, AnatomogramType.MALE);
        String fileNameFemale = subject.getAnatomogramFileName(HOMO_SAPIENS_SPECIES, AnatomogramType.FEMALE);
        String fileNameMouseMale = subject.getAnatomogramFileName(MOUSE_SPECIES, AnatomogramType.MALE);
        String fileNameMouseFemale = subject.getAnatomogramFileName(MOUSE_SPECIES, AnatomogramType.FEMALE);
        String fileNameRatMale = subject.getAnatomogramFileName(RAT_SPECIES, AnatomogramType.MALE);
        String fileNameRatFemale = subject.getAnatomogramFileName(RAT_SPECIES, AnatomogramType.FEMALE);

        assertThat(fileNameMale, is(HOMO_SAPIENS_MALE_FILE_NAME));
        assertThat(fileNameFemale, is(HOMO_SAPIENS_FEMALE_FILE_NAME));
        assertThat(fileNameMouseMale, is(MOUSE_MALE_FILE_NAME));
        assertThat(fileNameMouseFemale, is(MOUSE_FEMALE_FILE_NAME));
        assertThat(fileNameRatMale, is(RAT_FILE_NAME));
        assertThat(fileNameRatFemale, is(nullValue()));
    }

    @Test
    public void testGetArrayExpressURL() throws Exception {
        assertThat(subject.getArrayExpressURL(EXPERIMENT_ACCESSION), is(ARRAYEXPRESS_URL + EXPERIMENT_ACCESSION));
    }

    @Test
    public void testGetArrayExpressArrayURL() throws Exception {
        assertThat(subject.getArrayExpressArrayURL(A_AFFY_35_NAME), is(ARRAYEXPRESS_ARRAYS_URL + A_AFFY_35));
    }

    @Test
    public void testGetPubMedURL() throws Exception {
        assertThat(subject.getPubMedURL(PUB_MED_ID), is(PUBMED_URL + PUB_MED_ID));
    }

    @Test
    public void testGetFeedbackEmailAddress() throws Exception {
        assertThat(subject.getFeedbackEmailAddress(), is(FEEDBACK_EMAIL_VALUE));
    }

    @Test
    public void buildDownloadUrl() {
        //when
        String downloadUrl = subject.buildDownloadURL(httpServletRequestMock);

        //then
        assertThat(downloadUrl, is(DOWNLOAD_URL));
    }

    @Test
    public void buildDownloadUrlWithoutQueryParameters() {
        //given
        given(httpServletRequestMock.getAttribute("javax.servlet.forward.query_string")).willReturn(null);

        //when
        String downloadUrl = subject.buildDownloadURL(httpServletRequestMock);

        //then
        assertThat(downloadUrl, is(EXPERIMENT_URL + ".tsv"));
    }

    @Test
    public void buildServerUrl() throws Exception {

        when(httpServletRequestMock.getServerName()).thenReturn("localhost");
        when(httpServletRequestMock.getServerPort()).thenReturn(9090);
        when(httpServletRequestMock.getContextPath()).thenReturn("/gxa");
        when(httpServletRequestMock.isSecure()).thenReturn(false);

        assertThat(subject.buildServerURL(httpServletRequestMock), is("http://localhost:9090/gxa"));
    }

}