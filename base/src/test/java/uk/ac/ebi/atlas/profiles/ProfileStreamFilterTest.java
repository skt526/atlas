package uk.ac.ebi.atlas.profiles;

import com.google.common.collect.ImmutableList;
import org.junit.Test;
import uk.ac.ebi.atlas.experimentpage.context.RnaSeqRequestContext;
import uk.ac.ebi.atlas.model.AssayGroup;
import uk.ac.ebi.atlas.model.DescribesDataColumns;
import uk.ac.ebi.atlas.model.experiment.differential.*;
import uk.ac.ebi.atlas.model.experiment.differential.rnaseq.RnaSeqProfile;
import uk.ac.ebi.atlas.web.DifferentialRequestPreferences;

import java.util.Collection;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static uk.ac.ebi.atlas.testutils.MockExperiment.createDifferentialExperiment;

public class ProfileStreamFilterTest {
    private AssayGroup g1 = new AssayGroup("g1", "assay_1");
    private AssayGroup g2 = new AssayGroup("g2", "assay_2");
    private AssayGroup g3 = new AssayGroup("g3", "assay_3");

    private Contrast g1_g2 = new Contrast("g1_g2", null, g1, g2, "contrast 1");
    private Contrast g1_g3 = new Contrast("g1_g3", null, g1, g3, "contrast 2");

    private DifferentialExperiment experiment = createDifferentialExperiment("accession", ImmutableList.of(g1_g2, g1_g3));

    private RnaSeqProfile profile(DifferentialExpression expressionForG1_G2,
                                  DifferentialExpression expressionForG1_G3) {
        RnaSeqProfile profile = new RnaSeqProfile("id", "name");
        Optional.ofNullable(expressionForG1_G2).ifPresent(e -> profile.add(g1_g2, e));
        Optional.ofNullable(expressionForG1_G3).ifPresent(e -> profile.add(g1_g3, e));
        return profile;
    }

    private void test(RnaSeqProfile profile, DifferentialRequestPreferences differentialRequestPreferences, boolean expected){
        Predicate f = ProfileStreamFilter.create(new RnaSeqRequestContext(differentialRequestPreferences, experiment));
        assertThat(
                profile.toString(),
                f.test(profile),
                is(expected)
        );
    }

    private void test(RnaSeqProfile profile, boolean expected){
        test(profile, new DifferentialRequestPreferences(), expected);
    }

    private void test(RnaSeqProfile profile, Collection<Contrast> keepContrasts, boolean expected){
        DifferentialRequestPreferences differentialRequestPreferences = new DifferentialRequestPreferences();
        differentialRequestPreferences.setSelectedColumnIds(keepContrasts.stream().map(DescribesDataColumns::getId).collect(Collectors.toSet()));
        test(profile,differentialRequestPreferences , expected);
    }

    @Test
    public void filterOutEmptyProfiles(){
        test(profile(null, null), false);
        test(profile(new DifferentialExpression(0.01, 0.0), null), false);
        test(profile(new DifferentialExpression(0.01, 0.0), new DifferentialExpression(0.03, 0.0)), false);

    }

    @Test
    public void keepProfileIfExpressedSomewhere(){
        test(profile(new DifferentialExpression(0.01, 2.0), null), true);
        test(profile(new DifferentialExpression(0.01, -2.0), null), true);
        test(profile(new DifferentialExpression(0.01, 2.0), new DifferentialExpression(0.03, 4.0)), true);
    }

    @Test
    public void keepProfileIfExpressedOnSpecifiedColumns(){
        test(profile(
                new DifferentialExpression(0.01, 2.0), new DifferentialExpression(0.03, 4.0)),
                ImmutableList.of(g1_g2, g1_g3), true);
        test(profile(
                new DifferentialExpression(0.01, 2.0), new DifferentialExpression(0.03, 4.0)),
                ImmutableList.of(g1_g2), true);
        test(profile(
                new DifferentialExpression(0.01, 2.0), new DifferentialExpression(0.03, 4.0)),
                ImmutableList.of(g1_g3), true);

        test(profile(new DifferentialExpression(0.01, 2.0), null), ImmutableList.of(g1_g2, g1_g3), true);
        test(profile(new DifferentialExpression(0.01, 2.0), null), ImmutableList.of(g1_g2), true);
        test(profile(new DifferentialExpression(0.01, 2.0), null), ImmutableList.of(g1_g3), false);
    }

}