/*
 * Copyright 2008-2013 Microarray Informatics Team, EMBL-European Bioinformatics Institute
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * For further details of the Gene Expression Atlas project, including source code,
 * downloads and documentation, please see:
 *
 * http://gxa.github.com/gxa
 */

package uk.ac.ebi.atlas.web.controllers.page.bioentity;

import com.google.common.collect.Lists;
import com.google.common.collect.SortedSetMultimap;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.context.annotation.Scope;
import uk.ac.ebi.atlas.dao.ArrayDesignDao;
import uk.ac.ebi.atlas.solr.query.SolrQueryService;
import uk.ac.ebi.atlas.utils.ReactomeBiomartClient;
import uk.ac.ebi.atlas.utils.UniProtClient;

import javax.inject.Inject;
import javax.inject.Named;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.MessageFormat;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.SortedSet;

@Named("bioEntityPropertyService")
@Scope("request")
public class BioEntityPropertyService {

    public static final String PROPERTY_TYPE_DESCRIPTION = "description";

    private SolrQueryService solrQueryService;

    private UniProtClient uniProtClient;

    private BioEntityCardProperties bioEntityCardProperties;

    private SortedSetMultimap<String, String> propertyValuesByType;

    private String species;

    private SortedSet<String> entityNames;

    private String identifier;

    private ReactomeBiomartClient reactomeBiomartClient;

    private ArrayDesignDao arrayDesignDao;

    @Inject
    public BioEntityPropertyService(SolrQueryService solrQueryService, UniProtClient uniProtClient, BioEntityCardProperties bioEntityCardProperties, ReactomeBiomartClient reactomeBiomartClient, ArrayDesignDao arrayDesignDao) {
        this.solrQueryService = solrQueryService;
        this.uniProtClient = uniProtClient;
        this.bioEntityCardProperties = bioEntityCardProperties;
        this.reactomeBiomartClient = reactomeBiomartClient;
        this.arrayDesignDao = arrayDesignDao;
    }

    void init(String species, SortedSetMultimap<String, String> propertyValuesByType, SortedSet<String> entityNames, String identifier) {
        this.species = species;
        this.propertyValuesByType = propertyValuesByType;
        this.entityNames = entityNames;
        this.identifier = identifier;

        // this is to add mirbase sequence for ENSEMBL mirnas
        if (propertyValuesByType.containsKey("mirbase_id") && !propertyValuesByType.containsKey("mirbase_sequence")) {
            addMirBaseSequence();
        }

    }

    public String getSpecies() {
        return species;
    }

    public List<PropertyLink> fetchPropertyLinks(String propertyType) {
        if ("reactome".equals(propertyType) && !propertyValuesByType.containsKey(propertyType)) {
            addReactomePropertyValues();
        } else if ("design_element".equals(propertyType) && !propertyValuesByType.containsKey(propertyType)) {
            addDesignElements();
        }

        List<PropertyLink> propertyLinks = Lists.newArrayList();
        for (String propertyValue : propertyValuesByType.get(propertyType)) {
            propertyLinks.add(createLink(propertyType, propertyValue, species));
        }
        return propertyLinks;
    }

    private void addMirBaseSequence() {
        String mirbase_id = propertyValuesByType.get("mirbase_id").first();
        Set<String> mirbase_sequence = solrQueryService.findPropertyValuesForGeneId(mirbase_id, "mirbase_sequence");
        propertyValuesByType.putAll("mirbase_sequence", mirbase_sequence);
    }

    private void addDesignElements() {
        List<String> designElements = arrayDesignDao.getDesignElements(identifier);
        if (!designElements.isEmpty()) {
            propertyValuesByType.putAll("design_element", designElements);
        }
    }

    public String getBioEntityDescription() {
        String description = getFirstValueOfProperty(PROPERTY_TYPE_DESCRIPTION);
        return StringUtils.substringBefore(description, "[");
    }

    public SortedSet<String> getEntityNames() {
        return entityNames;
    }

    String getFirstValueOfProperty(String propertyType) {
        Collection<String> properties = propertyValuesByType.get(propertyType);
        return CollectionUtils.isNotEmpty(properties) ? properties.iterator().next() : "";
    }

    void addReactomePropertyValues() {
        Collection<String> uniprotIds = propertyValuesByType.get("uniprot");
        if (CollectionUtils.isNotEmpty(uniprotIds)) {
            for (String uniprotId : uniprotIds) {
                Collection<String> reactomeIds = uniProtClient.fetchReactomeIds(uniprotId);
                propertyValuesByType.putAll("reactome", reactomeIds);
            }
        }
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

    PropertyLink createLink(String propertyType, String propertyValue, String species) {
        final String linkSpecies = species.replaceAll(" ", "_");

        String linkText = fetchLinkText(propertyType, propertyValue);

        String link = bioEntityCardProperties.getLinkTemplate(propertyType);
        if (link != null) {

            link = MessageFormat.format(link, getEncodedString(propertyValue), linkSpecies, identifier);

            return new PropertyLink(linkText, link);
        }
        return new PropertyLink(linkText);
    }

    String fetchLinkText(String propertyType, String propertyValue) {
        String displayName = propertyValue;
        if (propertyType.equals("ortholog")) {
            displayName = transformOrthologToSymbol(displayName);
        } else if (propertyType.equals("reactome")) {
            displayName = reactomeBiomartClient.fetchPathwayNameFailSafe(propertyValue);
        }
        return displayName;
    }

    String getEncodedString(String value) {
        try {
            return URLEncoder.encode(value, "ISO-8859-1");
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException("Cannot create URL from " + value, e);
        }
    }

}

