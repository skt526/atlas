package uk.ac.ebi.atlas.controllers.rest;

import org.springframework.context.annotation.Scope;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import uk.ac.ebi.atlas.controllers.JsonExceptionHandlingController;
import uk.ac.ebi.atlas.solr.bioentities.query.SolrBioentitiesSuggesterService;

import static uk.ac.ebi.atlas.utils.GsonProvider.GSON;

@RestController
@Scope("request")
public class AutoCompleteController extends JsonExceptionHandlingController {
    private final SolrBioentitiesSuggesterService suggesterService;

    public AutoCompleteController(SolrBioentitiesSuggesterService suggesterService) {
        this.suggesterService = suggesterService;
    }

    @RequestMapping(value = "/json/suggestions",
                    method = RequestMethod.GET,
                    produces = "application/json;charset=UTF-8")
    public String fetchTopSuggestions(
            @RequestParam(value = "query") String query,
            @RequestParam(value = "species", required = false, defaultValue = "") String species,
            @RequestParam(value = "suggestCount", required = false, defaultValue = "15") int suggestCount) {
        return GSON.toJson(suggesterService.fetchPropertySuggestions(query, suggestCount, species.split(",")));
    }
}
