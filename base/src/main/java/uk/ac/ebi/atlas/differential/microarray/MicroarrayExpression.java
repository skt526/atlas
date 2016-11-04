
package uk.ac.ebi.atlas.differential.microarray;


import com.google.common.base.Objects;
import uk.ac.ebi.atlas.differential.Contrast;
import uk.ac.ebi.atlas.differential.DifferentialExpression;

public class MicroarrayExpression extends DifferentialExpression {

    private double tstatistic;

    public MicroarrayExpression(double pValue, double foldChange, double tstatistic, Contrast contrast) {
        super(pValue, foldChange, contrast);
        this.tstatistic = tstatistic;
    }

    //It's used in jsp EL
    public double getTstatistic() {
        return tstatistic;
    }

    @Override
    public String toString() {
        return Objects.toStringHelper(this)
                .add("p-value", getPValue())
                .add("foldChange", getFoldChange())
                .toString();
    }
}
