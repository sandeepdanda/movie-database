package dev.sandeep.rewatch.auth;

import dev.sandeep.rewatch.auth.model.UserItem;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/watchlist")
public class WatchlistController {

    private final DynamoDbTable<UserItem> table;

    public WatchlistController(DynamoDbEnhancedClient client) {
        this.table = client.table("UserActivity", TableSchema.fromBean(UserItem.class));
    }

    @GetMapping
    public List<Map<String, String>> getWatchlist(Authentication auth) {
        String userId = auth.getPrincipal().toString();
        return table.query(QueryConditional.sortBeginsWith(
                        Key.builder().partitionValue("USER#" + userId).sortValue("WATCHLIST#").build()))
                .stream().flatMap(p -> p.items().stream())
                .map(i -> Map.of("movieId", i.getMovieId(), "movieTitle", i.getMovieTitle(), "createdAt", i.getCreatedAt()))
                .toList();
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addToWatchlist(@PathVariable String movieId, @RequestBody Map<String, String> body,
                                            Authentication auth) {
        String userId = auth.getPrincipal().toString();
        var item = new UserItem();
        item.setPk("USER#" + userId);
        item.setSk("WATCHLIST#" + movieId);
        item.setMovieId(movieId);
        item.setMovieTitle(body.getOrDefault("movieTitle", ""));
        item.setCreatedAt(Instant.now().toString());
        table.putItem(item);
        return ResponseEntity.ok(Map.of("status", "added"));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<?> removeFromWatchlist(@PathVariable String movieId, Authentication auth) {
        String userId = auth.getPrincipal().toString();
        table.deleteItem(Key.builder().partitionValue("USER#" + userId).sortValue("WATCHLIST#" + movieId).build());
        return ResponseEntity.ok(Map.of("status", "removed"));
    }
}
