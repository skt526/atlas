package uk.ac.ebi.atlas.commons.efo;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.arrayexpress.utils.efo.EFOLoader;
import uk.ac.ebi.arrayexpress.utils.efo.EFONode;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.Map;


@Named
@Scope("singleton")
public class EFOTreeNodesTrader {

    private static final Logger LOGGER = Logger.getLogger(EFOTreeNodesTrader.class);

    private String efoOwlFilePath;
    private Map<String, EFONode> urlToEFONode;

    @Inject
    public EFOTreeNodesTrader(@Value("#{configuration['efo.owl.file']}") String efoOwlFilePath) {
        this.efoOwlFilePath = efoOwlFilePath;
    }

    public Map<String, EFONode> getTreeNodes() {
        if (urlToEFONode == null) {
            try {
                EFOLoader efoLoader = new EFOLoader();
                LOGGER.debug("efoLoader.load " + efoOwlFilePath);
                urlToEFONode = efoLoader.load(new FileInputStream(efoOwlFilePath)).getMap();
            } catch (FileNotFoundException e) {
                throw new EFOTreeNodesTraderException(e);
            }
        }
        return urlToEFONode;
    }

    private class EFOTreeNodesTraderException extends RuntimeException {
        public EFOTreeNodesTraderException(Throwable e) {
            super(e);
        }
    }

}
