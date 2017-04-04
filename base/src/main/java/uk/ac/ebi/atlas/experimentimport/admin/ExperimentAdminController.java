package uk.ac.ebi.atlas.experimentimport.admin;

import com.google.common.base.Function;
import com.google.common.base.Optional;
import com.google.gson.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import uk.ac.ebi.atlas.controllers.ResourceNotFoundException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;

public class ExperimentAdminController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExperimentAdminController.class);

    private final ExperimentOps experimentOps;
    private final ExperimentAdminHelpPage helpPage = new ExperimentAdminHelpPage();
    private final Gson gson= new GsonBuilder().setPrettyPrinting().create();

    public ExperimentAdminController(ExperimentOps experimentOps) {
        this.experimentOps = experimentOps;
    }

    @RequestMapping(
            value = "",
            method = RequestMethod.GET,
            produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String listAllExperiments() {
        return doOp("all", "list");
    }

    @RequestMapping(
            value = "/{accessions}",
            method = RequestMethod.GET,
            produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String listExperiments(@PathVariable("accessions") String accessions) {
        if(accessions.equalsIgnoreCase("help")){
            return helpPage.getMessage();
        } else {
            return doOp(accessions, "list");
        }
    }

    @RequestMapping(
            value = "/{accessions}/{op}",
            method = RequestMethod.GET,
            produces = "application/json;charset=UTF-8")
    @ResponseBody
    public String doOp(@PathVariable("accessions") String accessionParameter, @PathVariable("op") String opParameter) {
        try {
            final Optional<Collection<String>> accessions = accessionParameter.length() == 0 || accessionParameter.toLowerCase().equals("all")
                    ? Optional.<Collection<String>>absent()
                    : Optional.of(readAccessions(accessionParameter));


            return gson.toJson(
                    maybeOps(opParameter)
                    .transform(new Function<List<Op>, JsonElement>() {
                        @Override
                        public JsonElement apply(List<Op> ops) {
                            return experimentOps.perform(accessions, ops);
                        }
                    }).or(usageMessage(opParameter))
            );
        } catch (Exception e) {
            return gson.toJson(errorMessage(accessionParameter, e));
        }
    }

    private Optional<List<Op>> maybeOps(String opParameter){
        try{
            return Optional.of(Op.opsForParameter(opParameter));
        } catch (IllegalArgumentException e){
            return Optional.absent();
        }
    }

    private JsonElement errorMessage(String accessionParameter, Exception e){
        JsonArray result = new JsonArray();
        JsonObject messageObject = new JsonObject();
        messageObject.addProperty("accession", accessionParameter);
        messageObject.addProperty("error", e.getMessage()!=null? e.getMessage() : e.toString());
        result.add(messageObject);
        return result;
    }

    private JsonElement usageMessage(String opParameter){
        JsonObject messageObject = new JsonObject();
        messageObject.addProperty("error","Could not understand: " + opParameter );
        messageObject.addProperty("help","see gxa/admin/experiments/help for more info");
        return messageObject;
    }

    private Collection<String> readAccessions(String accessionParameter) {
        if (accessionParameter.contains("*")) {
            List<String> result = new ArrayList<>();
            Pattern pattern = Pattern.compile(accessionParameter.replaceAll("\\*", ".*"));
            for (String experimentAccession : experimentOps.findAllExperiments()) {
                if (pattern.matcher(experimentAccession).matches()) {
                    result.add(experimentAccession);
                }
            }
            return result;
        } else {
            return Arrays.asList(accessionParameter.split(","));
        }
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    @ResponseBody
    public String handleResourceNotFoundException(Exception e) throws IOException {
        LOGGER.error(e.getMessage(), e);
        return e.getClass().getSimpleName() + ": " + e.getMessage();
    }

}