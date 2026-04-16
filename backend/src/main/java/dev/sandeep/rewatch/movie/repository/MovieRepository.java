package dev.sandeep.rewatch.movie.repository;

import dev.sandeep.rewatch.movie.model.MovieCatalogItem;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbIndex;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;

import java.util.List;

@Repository
public class MovieRepository {

    private final DynamoDbTable<MovieCatalogItem> table;
    private final DynamoDbIndex<MovieCatalogItem> gsi1;
    private final DynamoDbIndex<MovieCatalogItem> gsi2;

    public MovieRepository(DynamoDbEnhancedClient enhancedClient) {
        this.table = enhancedClient.table("MovieCatalog", TableSchema.fromBean(MovieCatalogItem.class));
        this.gsi1 = table.index("GSI1-EntityLookup");
        this.gsi2 = table.index("GSI2-RatingSort");
    }

    /**
     * AP1: Get all items for a movie (metadata + genres + cast + crew).
     * Single query on PK = MOVIE#{id}
     */
    public List<MovieCatalogItem> getMovieById(String movieId) {
        var request = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(
                        Key.builder().partitionValue("MOVIE#" + movieId).build()))
                .build();

        return table.query(request).stream()
                .flatMap(page -> page.items().stream())
                .toList();
    }

    /**
     * AP2: Movies by genre via GSI1.
     * GSI1PK = GENRE#{name}, sorted by releaseYear desc.
     */
    public List<MovieCatalogItem> getMoviesByGenre(String genre, int limit) {
        var request = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(
                        Key.builder().partitionValue("GENRE#" + genre).build()))
                .scanIndexForward(false)
                .limit(limit)
                .build();

        return gsi1.query(request).stream()
                .flatMap(page -> page.items().stream())
                .limit(limit)
                .toList();
    }

    /**
     * AP5: Movies by decade via GSI1.
     * GSI1PK = DECADE#{decade}s, sorted by popularity desc.
     */
    public List<MovieCatalogItem> getMoviesByDecade(String decade, int limit) {
        var request = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(
                        Key.builder().partitionValue("DECADE#" + decade).build()))
                .scanIndexForward(false)
                .limit(limit)
                .build();

        return gsi1.query(request).stream()
                .flatMap(page -> page.items().stream())
                .limit(limit)
                .toList();
    }

    /**
     * Top rated movies via GSI2.
     * GSI2PK = STATUS#Released, sorted by voteAvg desc.
     */
    public List<MovieCatalogItem> getTopRated(int limit) {
        var request = QueryEnhancedRequest.builder()
                .queryConditional(QueryConditional.keyEqualTo(
                        Key.builder().partitionValue("STATUS#Released").build()))
                .scanIndexForward(false)
                .limit(limit)
                .build();

        return gsi2.query(request).stream()
                .flatMap(page -> page.items().stream())
                .limit(limit)
                .toList();
    }
}
