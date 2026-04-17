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

        var items = table.query(QueryConditional.keyEqualTo(
                        Key.builder().partitionValue("USER#" + userId).build()))
                .stream().flatMap(p -> p.items().stream()).toList();

        var ratings = items.stream().filter(i -> i.getSk().startsWith("RATING#")).toList();
        var watchlist = items.stream().filter(i -> i.getSk().startsWith("WATCHLIST#")).toList();

        Map<Integer, Long> ratingDist = ratings.stream()
                .collect(Collectors.groupingBy(i -> i.getRating().intValue(), Collectors.counting()));
        double avgRating = ratings.stream().mapToDouble(UserItem::getRating).average().orElse(0);

        Map<String, Integer> genreCounts = new HashMap<>();
        Map<String, Integer> decadeCounts = new HashMap<>();
        for (var r : ratings) {
            movieService.getMovieById(r.getMovieId()).ifPresent(movie -> {
                movie.genres().forEach(g -> genreCounts.merge(g.name(), 1, Integer::sum));
                if (movie.releaseYear() != null && movie.releaseYear().length() >= 4) {
                    String decade = movie.releaseYear().substring(0, 3) + "0s";
                    decadeCounts.merge(decade, 1, Integer::sum);
                }
            });
        }

        String favoriteGenre = genreCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);
        String favoriteDecade = decadeCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse(null);

        // Achievements
        List<Map<String, String>> achievements = new ArrayList<>();
        if (ratings.size() >= 1) achievements.add(Map.of("id", "first", "title", "First Taste", "desc", "Rated your first movie", "icon", "🍷"));
        if (ratings.size() >= 10) achievements.add(Map.of("id", "ten", "title", "Connoisseur", "desc", "Rated 10 movies", "icon", "🥂"));
        if (ratings.size() >= 50) achievements.add(Map.of("id", "fifty", "title", "Sommelier", "desc", "Rated 50 movies", "icon", "🏆"));
        if (genreCounts.size() >= 5) achievements.add(Map.of("id", "explorer", "title", "Genre Explorer", "desc", "Rated 5+ genres", "icon", "🗺️"));
        if (watchlist.size() >= 10) achievements.add(Map.of("id", "collector", "title", "Collector", "desc", "10+ in watchlist", "icon", "📚"));
        if (avgRating >= 4.5 && ratings.size() >= 5) achievements.add(Map.of("id", "generous", "title", "The Generous", "desc", "Avg rating 4.5+", "icon", "💝"));
        if (avgRating > 0 && avgRating <= 2.5 && ratings.size() >= 5) achievements.add(Map.of("id", "critic", "title", "The Critic", "desc", "Tough grader", "icon", "🎯"));

        var result = new HashMap<String, Object>();
        result.put("totalRated", ratings.size());
        result.put("totalWatchlist", watchlist.size());
        result.put("averageRating", Math.round(avgRating * 10) / 10.0);
        result.put("ratingDistribution", ratingDist);
        result.put("topGenres", genreCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> Map.of("genre", e.getKey(), "count", e.getValue()))
                .toList());
        result.put("favoriteGenre", favoriteGenre);
        result.put("favoriteDecade", favoriteDecade);
        result.put("achievements", achievements);
        return result;
    }
}
