package uk.ac.ebi.atlas.streams;

import com.google.common.collect.Lists;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.commons.ObjectInputStream;
import uk.ac.ebi.atlas.model.ExperimentRun;
import uk.ac.ebi.atlas.model.ExpressionLevel;
import uk.ac.ebi.atlas.model.RpkmCutOffInputStreamFilter;

import javax.inject.Named;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.util.List;

import static com.google.common.base.Preconditions.checkNotNull;

@Named("experimentLoader")
@Scope("prototype")
public class ExpressionLevelInputStreamBuilder {

    private static final Logger logger = Logger.getLogger(ExpressionLevelInputStreamBuilder.class);


    @Value("#{webappProperties['magetab.idf.url.template']}")
    private String idfFileUrlTemplate;

    @Value("#{webappProperties['magetab.test.datafile.url']}")
    private String dataFileURL;

    private Double rpkmCutOffValue;

    public ObjectInputStream<ExpressionLevel> createFor(String experimentAccession) {

        String idfFileLocation = String.format(idfFileUrlTemplate, experimentAccession, experimentAccession);

        URL mageTabURL = buildURL(idfFileLocation);

        List<ExperimentRun> experimentRuns = Lists.newArrayList(MageTabInvestigation.parse(mageTabURL).extractExperimentRuns());

        URL dataFileURL = buildURL(this.dataFileURL);

        try {

            Reader dataFileReader = new InputStreamReader(dataFileURL.openStream());

            ObjectInputStream<ExpressionLevel> objectInputStream = new ExpressionLevelInputStream(dataFileReader, experimentRuns);

            if (rpkmCutOffValue == null){
                return objectInputStream;
            }

            return new RpkmCutOffInputStreamFilter(objectInputStream).setRpkmCutOffValue(rpkmCutOffValue);

        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new IllegalArgumentException("Error while parsing dataFileURL stream: " + e.getMessage());
        }
    }

    URL buildURL(String location) {
        try {
            checkNotNull(location);
            return new URL(location);
        } catch (IOException e) {
            logger.error(e.getMessage(), e);
            throw new IllegalArgumentException("Error while building URL for location " + location + ". Error details: " + e.getMessage());
        }

    }

    public ExpressionLevelInputStreamBuilder setDataFileURL(String dataFileURL) {

        this.dataFileURL = dataFileURL;
        return this;

    }

    public ExpressionLevelInputStreamBuilder setRpkmCutOff(double rpkmCutOffValue) {

        this.rpkmCutOffValue = rpkmCutOffValue;
        return this;

    }
}
