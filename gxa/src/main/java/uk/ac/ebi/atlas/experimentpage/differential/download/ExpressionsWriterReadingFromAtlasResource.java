
package uk.ac.ebi.atlas.experimentpage.differential.download;

import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.CSVWriter;
import com.google.common.base.Function;
import uk.ac.ebi.atlas.model.resource.AtlasResource;

import java.io.IOException;


class ExpressionsWriterReadingFromAtlasResource implements ExpressionsWriter {


    private final AtlasResource<CSVReader> reader;

    private CSVWriter csvWriter;

    private final Function<String[], String[]>
            whatToDoWithTheHeaders;

    public ExpressionsWriterReadingFromAtlasResource(AtlasResource<CSVReader> reader,
                                                     Function<String[], String[]>
                                                             whatToDoWithTheHeaders, CSVWriter csvWriter) {
        this.reader = reader;
        this.whatToDoWithTheHeaders = whatToDoWithTheHeaders;
        this.csvWriter = csvWriter;
    }

    @Override
    public Long write() throws IOException {

        long lineCount = 0;

        try (CSVReader csvReader = reader.get()) {
            String[] headers = whatToDoWithTheHeaders.apply(csvReader.readNext());

            csvWriter.writeNext(headers);

            String[] inputLine;
            while ((inputLine = csvReader.readNext()) != null) {
                csvWriter.writeNext(inputLine);
                lineCount++;
            }
        } catch (IOException e) {
            throw new IllegalStateException("Exception thrown while reading next csv line: " + e.getMessage());
        }

        csvWriter.flush();

        return lineCount;
    }

    @Override
    public void close() throws IOException {
        csvWriter.close();
    }

}