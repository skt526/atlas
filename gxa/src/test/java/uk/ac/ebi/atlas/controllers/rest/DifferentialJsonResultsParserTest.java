package uk.ac.ebi.atlas.controllers.rest;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.apache.commons.lang.RandomStringUtils;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import uk.ac.ebi.atlas.search.diffanalytics.DiffAnalytics;

import uk.ac.ebi.atlas.trader.ContrastTrader;

import java.util.List;
import java.util.Random;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.isA;
import static org.junit.Assert.assertThat;

@RunWith(MockitoJUnitRunner.class)
public class DifferentialJsonResultsParserTest {
    @Rule
    public ExpectedException thrown = ExpectedException.none();

    private DifferentialJsonResultsParser subject;

    @Mock
    private ContrastTrader contrastTraderMock;

    @Before
    public void setUp() {
        subject = new DifferentialJsonResultsParser(contrastTraderMock);
    }

    @Test
    public void emptyJsonResultArrayProducesEmptyList() {
        JsonObject result = buildJsonObject(0, false);

        List<DiffAnalytics> expression = subject.parseDifferentialResults(result);
        assertThat(expression, hasSize(0));
    }

    @Test
    public void numberOfJsonObjectsInResultArrayProducesEqualLengthList() {
        JsonObject result = buildJsonObject(3, false);

        List<DiffAnalytics> expression = subject.parseDifferentialResults(result);
        assertThat(expression, hasSize(3));
    }

    @Test
    public void secondJsonObjectsInResultArrayEqualsSecondElementOfList() {
        JsonObject result = buildJsonObject(4, false);

        List<DiffAnalytics> expression = subject.parseDifferentialResults(result);

        assertThat(expression.get(1).getExperimentAccession(), isA(String.class));
        assertThat(expression.get(1).getBioentityId(), isA(String.class));
        assertThat(expression.get(1).getSpecies(), isA(String.class));
        assertThat(expression.get(1).getExpression().getPValue(), isA(Double.class));
        assertThat(expression.get(1).getExpression().getFoldChange(), isA(Double.class));
    }

    @Test
    public void testingJsonObjectWithoutTstatistic() {
        JsonObject testObject = new JsonObject();

        testObject.addProperty("experiment_accession", "e" + 4);
        testObject.addProperty("contrast_id", "c" + 4);
        testObject.addProperty("bioentity_identifier", "id" + 4);
        testObject.addProperty("species", "org" + 4);
        testObject.addProperty("p_value", 1.14);
        testObject.addProperty("fold_change", -1.14);
        testObject.addProperty("keyword_symbol", 4);

        JsonArray testArray = new JsonArray();

        testArray.add(testObject);

        JsonObject result = new JsonObject();

        result.add("results", testArray);

        List<DiffAnalytics> expression = subject.parseDifferentialResults(result);

        assertThat(expression, hasSize(1));
    }

    @Test
    public void rejectInvalidJsonObjectsInResultArray() {
        JsonObject result = buildJsonObject(3, true);

        List<DiffAnalytics> expression = subject.parseDifferentialResults(result);

        assertThat(expression, hasSize(3));
    }

    private JsonObject buildJsonObject(int arraySize, boolean addInvalidElement) {
        JsonObject result = new JsonObject();
        JsonArray results = new JsonArray();
        JsonObject testObject = new JsonObject();
        Random random = new Random();

        for (int i = 1; i <= arraySize; i++) {
            JsonObject element = new JsonObject();
            element.addProperty("experiment_accession", RandomStringUtils.random(5) + i);
            element.addProperty("contrast_id", RandomStringUtils.random(7) + i);
            element.addProperty("bioentity_identifier", RandomStringUtils.random(3) + i);
            element.addProperty("species", RandomStringUtils.random(4) + i);
            element.addProperty("p_value", random.nextDouble());
            element.addProperty("fold_change", random.nextDouble());
            element.addProperty("t_statistic", random.nextDouble());
            element.addProperty("keyword_symbol", i);
            results.add(element);
        }

        if (addInvalidElement) {
            testObject.addProperty("experiment accession", RandomStringUtils.random(5));
            testObject.addProperty("contrast_id", RandomStringUtils.random(10));
            testObject.addProperty("bioentity_identifier", RandomStringUtils.random(15));
            testObject.addProperty("species", RandomStringUtils.random(6));
            testObject.addProperty("p_value", random.nextDouble());
            testObject.addProperty("fold_change", random.nextDouble());
            testObject.addProperty("t_statistic", random.nextDouble());
            testObject.addProperty("keyword_symbol", 4);

            results.add(testObject);
        }

        result.add("results", results);
        return result;
    }
}
