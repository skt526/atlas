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

package uk.ac.ebi.atlas.solr.admin.index.conditions;

import org.apache.solr.client.solrj.beans.Field;

import java.util.Collection;
import java.util.Objects;

public class ConditionProperty {

    @Field("experiment_accession")
    private String experimentAccession;

    @Field("group_type")
    private String groupType;

    @Field("contrast_id")
    private String contrastId;

    @Field("property_values")
    private Collection<String> values;

    //Required by solr
    public ConditionProperty() {
    }

    public ConditionProperty(String experimentAccession, String groupType, String contrastId, Collection<String> values) {
        this.experimentAccession = experimentAccession;
        this.groupType = groupType;
        this.contrastId = contrastId;
        this.values = values;
    }

    @Override
    public int hashCode() {return Objects.hash(experimentAccession, groupType, contrastId, values);}

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {return true;}
        if (obj == null || getClass() != obj.getClass()) {return false;}
        final ConditionProperty other = (ConditionProperty) obj;
        return Objects.equals(this.experimentAccession, other.experimentAccession) && Objects.equals(this.groupType, other.groupType) && Objects.equals(this.contrastId, other.contrastId) && Objects.equals(this.values, other.values);
    }

    public String getExperimentAccession() {

        return experimentAccession;
    }

    public void setExperimentAccession(String experimentAccession) {
        this.experimentAccession = experimentAccession;
    }

    public String getGroupType() {
        return groupType;
    }

    public void setGroupType(String groupType) {
        this.groupType = groupType;
    }

    public String getContrastId() {
        return contrastId;
    }

    public void setContrastId(String contrastId) {
        this.contrastId = contrastId;
    }

    public Collection<String> getValues() {
        return values;
    }

    public void setValues(Collection<String> values) {
        this.values = values;
    }
}
