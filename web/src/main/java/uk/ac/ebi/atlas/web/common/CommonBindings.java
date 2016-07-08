package uk.ac.ebi.atlas.web.common;

import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;
import uk.ac.ebi.atlas.web.GeneQuery;
import uk.ac.ebi.atlas.web.GeneQueryPropertyEditor;

@ControllerAdvice
public class CommonBindings {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(GeneQuery.class, new GeneQueryPropertyEditor());
    }

}
