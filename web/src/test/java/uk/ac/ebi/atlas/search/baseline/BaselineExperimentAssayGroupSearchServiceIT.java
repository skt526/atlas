package uk.ac.ebi.atlas.search.baseline;

import com.google.common.collect.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import uk.ac.ebi.atlas.model.Species;
import uk.ac.ebi.atlas.model.SpeciesTest;
import uk.ac.ebi.atlas.search.SemanticQuery;
import uk.ac.ebi.atlas.search.analyticsindex.AnalyticsSearchService;
import uk.ac.ebi.atlas.trader.SpeciesFactory;

import javax.inject.Inject;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(locations = {"classpath:applicationContext.xml", "classpath:solrContextIT.xml", "classpath:oracleContext.xml"})
public class BaselineExperimentAssayGroupSearchServiceIT {

    private static final Species MADE_UP_SPECIES = new Species("definitely not real species", "large yeti",
            "ensembldb","animals");

    @Inject
    BaselineExperimentAssayGroupSearchService subject;

    @Inject
    AnalyticsSearchService analyticsSearchService;
    
    public void kinaseIsAPopularProtein()  {
        List<String> results = resultsFor("kinase","",SpeciesFactory.NULL);

        assertTrue(Sets.newHashSet(results).size() > 2);
    }

    @Test
    public void conditionsOR() {
        String geneQuery = "";
        String condition = "adipose thymus";
        String species = "";

        Set<BaselineExperimentAssayGroup> results = subject.query(geneQuery, condition, species, ImmutableSet.<String>of());
        assertTrue(results.size()>0);
        for(BaselineExperimentAssayGroup result: results){
            Set<String> factorValues = result.getDefaultFactorValuesForSpecificAssayGroupsWithCondition();

            assertTrue(factorValues.contains("adipose") || factorValues.contains("thymus"));

        }
    }

    @Test
    public void conditionsAND()  {
        List<String> r0 = resultsFor("", "heart",SpeciesFactory.NULL);
        List<String> r1 = resultsFor("", "heart AND heart",SpeciesFactory.NULL);
        List<String> r2 = resultsFor("", "heart AND surely_nonexistent_organism_part",SpeciesFactory.NULL);
        assertEquals(r0,r1);
        assertEquals(Lists.newArrayList(), r2);
    }

    @Test
    public void buildResults_MTAB513() {
        ImmutableSetMultimap<String, String> assayGroupsWithExpressionByExperiment =
                new ImmutableSetMultimap.Builder<String, String>()
                .putAll("E-MTAB-513", "g12", "g14", "g16", "g8", "g2", "g4", "g9")
                .build();
        String species = "";
        Set<BaselineExperimentAssayGroup> baselineExperimentAssayGroups = subject.buildResults(assayGroupsWithExpressionByExperiment, true, species);
        BaselineExperimentAssayGroup searchResult = baselineExperimentAssayGroups.iterator().next();

        assertThat(baselineExperimentAssayGroups, hasSize(1));
        assertThat(searchResult.getFilterFactors().size(), is(0));
    }

    @Test
    public void wildTypeIsAValidConditionForThatWormExperiment(){
        List<String> results = resultsFor("","wild type genotype", SpeciesFactory.NULL);
        assertTrue(results.contains("E-MTAB-2812"));
    }

    @Test
    public void weHaveAnMTABExperimentAboutASPM(){
        for(String name: resultsFor("ASPM","",SpeciesFactory.NULL)){
            if (Pattern.matches(".*MTAB.*", name)){
                return;
            }
        }
        fail();
    }

    @Test
    public void madeUpParametersYieldNoResults(){
        assertEquals(Lists.newArrayList(), resultsFor("such_a_wrong_gene_query","",SpeciesFactory.NULL));
        assertEquals(Lists.newArrayList(), resultsFor("","totally_made_up_condition",SpeciesFactory.NULL));
        assertEquals(Lists.newArrayList(), resultsFor("","",MADE_UP_SPECIES));
    }

    @Test
    public void partiallyMadeUpParametersYieldNoResultsEither(){
        /* interestingly that doesn't hold
        assertEquals(Lists.newArrayList(), resultsFor("Such_a_wrong_gene_query", "adult",""));
        */
        assertEquals(Lists.newArrayList(), resultsFor("","totally_made_up_condition",SpeciesTest.HUMAN));
        assertEquals(Lists.newArrayList(), resultsFor("protein_coding","",MADE_UP_SPECIES));
    }

    @Test
    public void someResultsForAdult(){
        List<String> r0 = resultsFor("","adult", SpeciesFactory.NULL);
        List<String> r1 = resultsFor("","adult", SpeciesTest.HUMAN);
        assertTrue(r0.size()>10);
        assertTrue(r1.size()>0);
        assertTrue(r0.containsAll(r1));
        assertFalse(r1.equals(r0));
    }


    private List<String> resultsFor(String geneQuery, String condition, Species species){
        return getExperimentAccessions(
                subject.query(
                        geneQuery, condition, species.mappedName, analyticsSearchService.searchBioentityIdentifiers
                                (SemanticQuery.create(geneQuery), SemanticQuery.create(), species)
                )
        );
    }

    private static List<String> getExperimentAccessions(Set<BaselineExperimentAssayGroup> results) {
        List<String> names = Lists.newArrayList();
        for (BaselineExperimentAssayGroup result: results) {
            names.add(result.getExperimentAccession());
        }
        return names;
    }
}
