package uk.ac.ebi.atlas.model.experiment;

import com.google.auto.value.AutoValue;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import uk.ac.ebi.atlas.model.experiment.baseline.Factor;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@AutoValue
public abstract class ExperimentDisplayDefaults {

    /*
    The UI treats it as entirely reasonable that there can be multiple defaults, but the curators aren't ready yet.
     */
    abstract Map<String, String> defaultFilterValues();
    public abstract List<String> prescribedOrderOfFilters();


    public List<String> defaultFilterValuesForFactor(String factorHeader){
        return defaultFilterValues().containsKey(Factor.normalize(factorHeader))
                ? ImmutableList.of(defaultFilterValues().get(Factor.normalize(factorHeader)))
                : ImmutableList.<String>of();
    }
    /*
    The curators used to have to specify a slice of the experiment they want displayed, say which dimension to splay
    (defaultQueryFactorType) and values for other filters. How cumbersome!

    Note that for gene page, this what will go in the columns, and experiment + other factors will go on rows
     */
    String defaultQueryFactorType() {
        for(String filter: prescribedOrderOfFilters()){
            if(! defaultFilterValues().keySet().contains(filter)){
                return filter;
            }
        }
        return "";
    }

    /*
    See factors.xml e.g.
        <defaultFilterFactors>
        <filterFactor>
            <type>TIME</type>
            <value>4 day</value>
        </filterFactor>
        <filterFactor>
            <type>CELL_TYPE</type>
            <value>CD4+ T cell</value>
        </filterFactor>
        <filterFactor>
            <type>INFECT</type>
            <value>Plasmodium chabaudi chabaudi</value>
        </filterFactor>
    </defaultFilterFactors>
    <defaultQueryFactorType>INDIVIDUAL</defaultQueryFactorType>
    <menuFilterFactorTypes>CELL_TYPE, INDIVIDUAL, INFECT, TIME</menuFilterFactorTypes>

     */
    public static ExperimentDisplayDefaults create(){
        return create(ImmutableMap.<String, String>of(), ImmutableList.<String>of());
    }

    public static ExperimentDisplayDefaults create(Collection<Factor> defaultFilterFactors,
                                                   String defaultQueryFactorType,
                                                   List<String> menuFilterFactorTypes){
        return create(defaultFilterFactors, ImmutableList.<String>builder().add(defaultQueryFactorType).addAll(menuFilterFactorTypes).build());
    }

    public static ExperimentDisplayDefaults create(Collection<Factor> defaultFilterFactors,
                                                   List<String> prescribedOrderOfFilters){
        ImmutableMap.Builder<String, String> b = ImmutableMap.builder();
        for(Factor factor : defaultFilterFactors){
            b.put(factor.getType(), factor.getValue());
        }
        return create(b.build(),prescribedOrderOfFilters);
    }


    static ExperimentDisplayDefaults create(Map<String, String> defaultFilterValues,
                                                   List<String> prescribedOrderOfFilters){
        ImmutableList.Builder<String> b = ImmutableList.<String>builder().addAll(prescribedOrderOfFilters);
        for(String filterType: defaultFilterValues.keySet()){
            if(!prescribedOrderOfFilters.contains(filterType)){
                b.add(filterType);
            }
        }
        return new AutoValue_ExperimentDisplayDefaults(defaultFilterValues,prescribedOrderOfFilters);
    }


}
