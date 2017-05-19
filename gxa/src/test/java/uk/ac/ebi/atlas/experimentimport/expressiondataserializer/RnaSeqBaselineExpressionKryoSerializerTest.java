package uk.ac.ebi.atlas.experimentimport.expressiondataserializer;

import com.google.common.collect.ImmutableList;
import org.junit.Before;
import org.junit.Test;
import uk.ac.ebi.atlas.resource.DataFileHub;
import uk.ac.ebi.atlas.resource.MockDataFileHub;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.*;

public class RnaSeqBaselineExpressionKryoSerializerTest {

    String accession = "E-MTAB-513";

    MockDataFileHub dataFileHub;

    RnaSeqBaselineExpressionKryoSerializer subject;

    @Before
    public void setUp(){
        dataFileHub = MockDataFileHub.get();
        dataFileHub.addExpressionFile(accession, ImmutableList.of(
                new String[]{"Gene ID", "Gene name", "g1"},
                new String[]{"id_1", "name_1", "1.337"}
        ));

        if(dataFileHub.getKryoFile(accession).exists()){
            dataFileHub.getKryoFile(accession).get().delete();
        }

        subject = new RnaSeqBaselineExpressionKryoSerializer(dataFileHub);
    }

    @Test
    public void testSerializeExpressionData() throws Exception {
        assertThat(dataFileHub.getKryoFile(accession).exists(), is(false));

        subject.serializeExpressionData(accession);

        assertThat(dataFileHub.getKryoFile(accession).exists(), is(true));
    }
}