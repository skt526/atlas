package uk.ac.ebi.atlas.metadata;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;
import uk.ac.ebi.atlas.configuration.WebConfig;
import uk.ac.ebi.atlas.testutils.JdbcUtils;

import javax.inject.Inject;
import java.io.UncheckedIOException;
import java.nio.file.NoSuchFileException;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ContextConfiguration(classes = WebConfig.class)
class CellMetadataServiceIT {
    @Inject
    private CellMetadataDao cellMetadataDao;
    @Inject
    private JdbcUtils jdbcUtils;

    private CellMetadataService subject;

    @BeforeEach
    void setUp() {
        this.subject = new CellMetadataService(cellMetadataDao);
    }

    @Test
    void existingInferredCellType() {
        // Ideally we would retrieve a random experiment accession, but not all experiments have the inferred cell
        // type characteristic
        String cellId = jdbcUtils.fetchRandomCellFromExperiment("E-ENAD-14");
        assertThat(
                subject.getInferredCellType(
                        "E-ENAD-14",
                        cellId))
                .isPresent();
    }

    @Test
    void inferredCellTypeForInvalidExperimentId() {
        assertThat(subject.getInferredCellType("FOO", "FOO")).isNotPresent();
    }

    @Test
    void inferredCellTypeForInvalidCellId() {
        assertThat(subject.getInferredCellType("E-ENAD-14", "FOO")).isNotPresent();
    }

    @ParameterizedTest
    @MethodSource("experimentsWithFactorsProvider")
    void factorsForValidExperimentAccession(String experimentAccession) {
        String cellId = jdbcUtils.fetchRandomCellFromExperiment(experimentAccession);

        assertThat(subject.getFactors(experimentAccession, cellId)).isNotEmpty();
    }

    @Test
    void factorsForInvalidExperiment() {
        assertThat(subject.getFactors("FOO", "FOO")).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("experimentsWithMetadataProvider")
    void metadataForValidExperimentAccession(String experimentAccession) {
        String cellId = jdbcUtils.fetchRandomCellFromExperiment(experimentAccession);

        assertThat(subject.getMetadata(experimentAccession, cellId)).isNotEmpty();
    }

    @Test
    void metadataForInvalidExperiment() {
        assertThatExceptionOfType(UncheckedIOException.class).isThrownBy(
                () -> subject.getMetadata("FOO", "FOO"))
                .withCauseInstanceOf(NoSuchFileException.class);;
    }

    private Iterable<String> experimentsWithMetadataProvider() {
        // E-GEOD-99058 does not have any metadata (factors or inferred cell types)
        return jdbcUtils.getPublicSingleCellExperimentAccessions()
                .stream()
                .filter(accession -> !accession.equalsIgnoreCase("E-GEOD-99058"))
                .collect(Collectors.toSet());
    }

    private Iterable<String> experimentsWithFactorsProvider() {
        // E-GEOD-99058 and E-ENAD-13 do not have any factors
        return jdbcUtils.getPublicSingleCellExperimentAccessions()
                .stream()
                .filter(accession ->
                        !accession.equalsIgnoreCase("E-GEOD-99058") && !accession.equalsIgnoreCase("E-ENAD-13"))
                .collect(Collectors.toSet());
    }
}
