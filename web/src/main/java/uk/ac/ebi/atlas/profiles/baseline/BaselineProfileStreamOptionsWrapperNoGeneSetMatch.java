package uk.ac.ebi.atlas.profiles.baseline;

import com.google.common.collect.ImmutableSetMultimap;
import uk.ac.ebi.atlas.commands.context.BaselineRequestContext;
import uk.ac.ebi.atlas.model.baseline.Factor;

import java.util.Set;

public class BaselineProfileStreamOptionsWrapperNoGeneSetMatch implements BaselineProfileStreamOptions {

    private BaselineRequestContext context;

    public BaselineProfileStreamOptionsWrapperNoGeneSetMatch(BaselineRequestContext context) {
        this.context = context;
    }

    @Override
    public Set<String> getSelectedGeneIDs() {
        return context.getSelectedGeneIDs();
    }

    @Override
    public boolean isSpecific() {
        return context.isSpecific();
    }

    @Override
    public Set<Factor> getSelectedQueryFactors() {
        return context.getSelectedQueryFactors();
    }

    @Override
    public Set<Factor> getAllQueryFactors() {
        return context.getAllQueryFactors();
    }

    @Override
    public ImmutableSetMultimap<String, String> getGeneSetIdsToGeneIds() {
        return context.getGeneSetIdsToGeneIds();
    }

    @Override
    public String getExperimentAccession() {
        return context.getExperimentAccession();
    }

    @Override
    public double getCutoff() {
        return context.getCutoff();
    }

    @Override
    public String getQueryFactorType() {
        return context.getQueryFactorType();
    }

    @Override
    public Set<Factor> getSelectedFilterFactors() {
        return context.getSelectedFilterFactors();
    }

    @Override
    public boolean asGeneSets() {
        return false;
    }

    @Override
    public Integer getHeatmapMatrixSize() {
        return context.getHeatmapMatrixSize();
    }
}
