package dev.sandeep.rewatch.auth;

import dev.sandeep.rewatch.auth.model.UserItem;
import dev.sandeep.rewatch.movie.service.MovieService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private final DynamoDbTable<UserItem> table;
    private final MovieService movieService;

    public StatsController(DynamoDbEnhancedClient client, MovieService movieService) {
        this.table = client.table("UserActivity", TableSchema.fromBean(UserItem.class));
        this.movieService = movieService;
    }

    @GetMapping
    public Map<String, Object> getStats(Authentication auth) {
        String userId = auth.getPrincipal().toString();

        // Get all user items
        var items = table.query(QueryConditional.keyEqualTo(
                        Key.builder().partitionValue("USER#" + userId).build()))
                .stream().flatMap(p -> p.items().stream()).toList();

        var ratings = items.stream().filter(i -> i.getSk().startsWith("RATING#")).toList();
        var watchlist = items.stream().filter(i -> i.getSk().startsWith("WATCHLIST#")).toList();

        // Rating distribution
        Map<Integer, Long> ratingDist = ratings.stream()
                .collect(Collectors.groupingBy(i -> i.getRating().intValue(), Collectors.counting()));

        // Average rating
        double avgRating = ratings.stream().mapToDouble(UserItem::getRating).average().orElse(0);

        // Genre breakdown from rated movies
        Map<String, Integer> genreCounts = new HashMap<>();
        for (var r : ratings) {
            movieService.getMovieById(r.getMovieId()).ifPresent(movie ->
                    movie.genres().forEach(g -> genreCounts.merge(g.name(), 1, Integer::sum)));
        }

        return Map.of(
                "totalRated", ratings.size(),
                "totalWatchlist", watchlist.size(),
                "averageRating", Math.round(avgRating * 10) / 10.0,
                "ratingDistribution", ratingDist,
                "topGenres", genreCounts.entrySet().stream()
                        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                        .limit(5)
                        .map(e -> Map.of("genre", e.getKey(), "count", e.getValue()))
                        .toList()
        );
    }
}
