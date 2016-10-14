package uk.ac.ebi.atlas.bioentity;

import com.google.common.collect.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.springframework.http.HttpStatus;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.ModelAndView;
import uk.ac.ebi.atlas.bioentity.properties.BioEntityCardProperties;
import uk.ac.ebi.atlas.bioentity.properties.BioEntityPropertyService;
import uk.ac.ebi.atlas.bioentity.properties.PropertyLink;
import uk.ac.ebi.atlas.model.ExperimentType;
import uk.ac.ebi.atlas.model.Species;
import uk.ac.ebi.atlas.search.SemanticQuery;
import uk.ac.ebi.atlas.search.analyticsindex.AnalyticsSearchService;
import uk.ac.ebi.atlas.search.analyticsindex.baseline.BaselineAnalyticsSearchService;
import uk.ac.ebi.atlas.search.analyticsindex.differential.DifferentialAnalyticsSearchService;
import uk.ac.ebi.atlas.trader.SpeciesFactory;
import uk.ac.ebi.atlas.web.controllers.ResourceNotFoundException;

import javax.inject.Inject;
import java.util.*;

public abstract class BioentityPageController {

    private static final String BIOENTITY_PROPERTY_NAME = "symbol";
    private static final String PROPERTY_TYPE_DESCRIPTION = "description";

    private BaselineAnalyticsSearchService baselineAnalyticsSearchService;
    private BioEntityCardProperties bioEntityCardProperties;

    protected AnalyticsSearchService analyticsSearchService;
    protected BioentityPropertyServiceInitializer bioentityPropertyServiceInitializer;
    protected BioEntityPropertyService bioEntityPropertyService;
    protected DifferentialAnalyticsSearchService differentialAnalyticsSearchService;
    private Gson gson = new GsonBuilder().setPrettyPrinting().serializeSpecialFloatingPointValues().create();


    protected SpeciesFactory speciesFactory;

    protected String[] propertyNames;

    @Inject
    public void setAnalyticsSearchService(AnalyticsSearchService analyticsSearchService) {
        this.analyticsSearchService = analyticsSearchService;
    }

    @Inject
    public void setBioentityPropertyServiceInitializer(BioentityPropertyServiceInitializer bioentityPropertyServiceInitializer) {
        this.bioentityPropertyServiceInitializer = bioentityPropertyServiceInitializer;
    }

    @Inject
    public void setBioEntityPropertyService(BioEntityPropertyService bioEntityPropertyService) {
        this.bioEntityPropertyService = bioEntityPropertyService;
    }

    @Inject
    public void setBioEntityCardProperties(BioEntityCardProperties bioEntityCardProperties) {
        this.bioEntityCardProperties = bioEntityCardProperties;
    }

    @Inject
    public void setDifferentialAnalyticsSearchService(DifferentialAnalyticsSearchService differentialAnalyticsSearchService) {
        this.differentialAnalyticsSearchService = differentialAnalyticsSearchService;
    }

    @Inject
    public void setBaselineAnalyticsSearchService(BaselineAnalyticsSearchService baselineAnalyticsSearchService) {
        this.baselineAnalyticsSearchService = baselineAnalyticsSearchService;
    }
    @Inject
    public void setSpeciesFactory(SpeciesFactory speciesFactory) {
        this.speciesFactory = speciesFactory;
    }

    // identifier (gene) = an Ensembl identifier (gene, transcript, or protein) or a mirna identifier or an MGI term.
    // identifier (gene set) = a Reactome id, Plant Ontology or Gene Ontology accession or an InterPro term
    public String showBioentityPage(String identifier, Species species, Model model, Set<String> experimentTypes){

        boolean hasDifferentialResults = ExperimentType.containsDifferential(experimentTypes);
        boolean hasBaselineResults = ExperimentType.containsBaseline(experimentTypes);

        if (!hasDifferentialResults && !hasBaselineResults) {
            return "empty-search-page";
        }

        model.addAttribute("hasBaselineResults", hasBaselineResults);
        model.addAttribute("hasDifferentialResults", hasDifferentialResults);

        if (hasBaselineResults) {
            model.addAttribute("jsonFacets", gson.toJson(baselineAnalyticsSearchService.findFacetsForTreeSearch
                    (SemanticQuery.create(identifier), species)));
        }

        model.addAllAttributes(pageDescriptionAttributes(identifier));
        /*
        TODO write a geneQuery that uniquely identifies the resource - I think it will be category:symbol or so.
        TODO For now the callback might match slightly too much which is a bug.
         */
        model.addAttribute("geneQuery", SemanticQuery.create(identifier).toUrlEncodedJson());
        model.addAttribute("propertyNames", buildPropertyNamesByTypeMap());

        model.addAttribute("bioentityProperties", gson.toJson(bioentityProperties()));

        return "bioentities";
    }

    protected abstract Map<String, Object> pageDescriptionAttributes(String identifier);

    private Map<String, String> buildPropertyNamesByTypeMap() {
        LinkedHashMap<String, String> result = Maps.newLinkedHashMap();
        for (String propertyName : propertyNames) {
            if (isDisplayedInPropertyList(propertyName)) {
                result.put(propertyName, bioEntityCardProperties.getPropertyName(propertyName));
            }
        }
        return result;
    }

    private boolean isDisplayedInPropertyList(String propertyType) {
        return !propertyType.equals(PROPERTY_TYPE_DESCRIPTION) && !propertyType.equals(BIOENTITY_PROPERTY_NAME);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public ModelAndView handleException(Exception e) {
        ModelAndView mav = new ModelAndView("search-error");
        mav.addObject("exceptionMessage", e.getMessage());
        return mav;
    }

    JsonArray bioentityProperties(){
        Map<String, String> propertyNamesByType = buildPropertyNamesByTypeMap();
        Map<String,List<PropertyLink>> propertyLinksByType = new HashMap<>();
        for(String propertyName: propertyNamesByType.keySet()){
            propertyLinksByType.put(propertyName, bioEntityPropertyService.fetchPropertyLinks(propertyName));
        }



        JsonArray result = new JsonArray();
        for(Map.Entry<String,String> e: propertyNamesByType.entrySet()){
            String type = e.getKey();

            JsonArray values = new JsonArray();
            for(PropertyLink propertyLink: propertyLinksByType.get(type)){
                values.add(propertyLink.toJson());
            }
            if(values.size()>0){
                JsonObject o = new JsonObject();
                o.addProperty("type",type);
                o.addProperty("name", e.getValue());
                o.add("values",values);
                result.add(o);
            }
        }
        return result;
    }
}
