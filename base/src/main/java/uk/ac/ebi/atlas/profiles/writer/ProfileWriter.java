package uk.ac.ebi.atlas.profiles.writer;

import au.com.bytecode.opencsv.CSVWriter;
import com.google.common.base.Function;
import uk.ac.ebi.atlas.model.Profile;

import java.io.IOException;
import java.io.Writer;

import static au.com.bytecode.opencsv.CSVWriter.NO_ESCAPE_CHARACTER;
import static au.com.bytecode.opencsv.CSVWriter.NO_QUOTE_CHARACTER;

public class ProfileWriter<Prof extends Profile> {

    private final String masthead;
    private final String[] columnHeaders;
    private final Function<Prof, String[]> profileToLine;
    private final Writer responseWriter;

    public ProfileWriter(Writer responseWriter, String masthead, String[] columnHeaders, Function<Prof, String[]> profileToLine){
        this.responseWriter = responseWriter;
        this.masthead = masthead;
        this.columnHeaders = columnHeaders;
        this.profileToLine = profileToLine;
    }

    public long write(Iterable<Prof> profiles){
        try {
            responseWriter.write(masthead+"\n");
            CSVWriter csvWriter = new CSVWriter(responseWriter, '\t', NO_QUOTE_CHARACTER, NO_ESCAPE_CHARACTER);
            csvWriter.writeNext(columnHeaders);
            long count = 0L;
            for(Prof p : profiles){
                csvWriter.writeNext(profileToLine.apply(p));
                count++;
            }

            csvWriter.flush();
            return count;
        } catch (IOException e){
            throw new RuntimeException(e);
        }
    }

}