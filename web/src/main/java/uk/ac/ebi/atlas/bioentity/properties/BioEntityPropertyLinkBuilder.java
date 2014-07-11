package uk.ac.ebi.atlas.bioentity.properties;

import org.apache.commons.lang.StringUtils;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.bioentity.go.GoTermTrader;
import uk.ac.ebi.atlas.bioentity.interpro.InterProTermTrader;
import uk.ac.ebi.atlas.solr.query.SolrQueryService;
import uk.ac.ebi.atlas.utils.ReactomeBiomartClient;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.util.Set;

@Named
@Scope("singleton")
public class BioEntityPropertyLinkBuilder {

    private BioEntityCardProperties bioEntityCardProperties;

    private ReactomeBiomartClient reactomeBiomartClient;

    private SolrQueryService solrQueryService;

    private GoTermTrader goTermTrader;

    private InterProTermTrader interProTermTrader;

    @Inject
    public BioEntityPropertyLinkBuilder(BioEntityCardProperties bioEntityCardProperties, ReactomeBiomartClient reactomeBiomartClient, SolrQueryService solrQueryService, GoTermTrader goTermTrader, InterProTermTrader interProTermTrader) {
        this.bioEntityCardProperties = bioEntityCardProperties;
        this.reactomeBiomartClient = reactomeBiomartClient;
        this.solrQueryService = solrQueryService;
        this.goTermTrader = goTermTrader;
        this.interProTermTrader = interProTermTrader;
    }

    public PropertyLink createLink(String identifier, String propertyType, String propertyValue, String species) {
        final String linkSpecies = species.replaceAll(" ", "_");

        String linkText = fetchLinkText(propertyType, propertyValue);

        String link = bioEntityCardProperties.getLinkTemplate(propertyType);

        if (link != null) {

            String linkValue = fetchLinkValue(propertyType, propertyValue);
            link = MessageFormat.format(link, linkValue, linkSpecies, identifier);

            return new PropertyLink(linkText, link);
        }
        return new PropertyLink(linkText);
    }

    String fetchLinkValue(String propertyType, String propertyValue) {
        String linkValue = propertyValue;
//        switch (propertyType) {
//            case "goterm":
//                linkValue = goTermTrader.getTerm(propertyValue);
//                break;
//            case "interproterm":
//                linkValue = interProTermTrader.getTerm(propertyValue);
//                break;
//        }
        return getEncodedString(linkValue);
    }

    String fetchLinkText(String propertyType, String propertyValue) {
        String displayName = propertyValue;
        switch (propertyType) {
            case "ortholog":
                displayName = transformOrthologToSymbol(displayName);
                break;
            case "reactome":
                displayName = reactomeBiomartClient.fetchPathwayNameFailSafe(propertyValue);
                break;
            case "go_accession":
                displayName = goTermTrader.getTerm(propertyValue);
                break;
            case "interpro_accession":
                displayName = interProTermTrader.getTerm(propertyValue);
                break;

        }
        return displayName;
    }

    String transformOrthologToSymbol(String identifier) {
        try {
            String species = solrQueryService.findSpeciesForBioentityId(identifier);

            String speciesToken = " (" + StringUtils.capitalize(species) + ")";

            Set<String> propertyValuesForGeneId = solrQueryService.findPropertyValuesForGeneId(identifier, "symbol");
            if (!propertyValuesForGeneId.isEmpty()) {
                String symbol = propertyValuesForGeneId.iterator().next();
                return symbol + speciesToken;
            }
            return identifier + speciesToken;
        } catch (Exception e) {
            return identifier;
        }
    }

    String getEncodedString(String value) {
        try {
            return URLEncoder.encode(value, "ISO-8859-1");
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Cannot create URL from " + value, e);
        }
    }
}
