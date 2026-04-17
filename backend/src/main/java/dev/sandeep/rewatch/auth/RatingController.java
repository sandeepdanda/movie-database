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
@RequestMapping("/api/v1/ratings")
public class RatingController {

    private final DynamoDbTable<UserItem> table;

    public RatingController(DynamoDbEnhancedClient client) {
        this.table = client.table("UserActivity", TableSchema.fromBean(UserItem.class));
    }

    @GetMapping
    public List<Map<String, Object>> getRatings(Authentication auth) {
        String userId = auth.getPrincipal().toString();
        return table.query(QueryConditional.sortBeginsWith(
                        Key.builder().partitionValue("USER#" + userId).sortValue("RATING#").build()))
                .stream().flatMap(p -> p.items().stream())
                .map(i -> Map.<String, Object>of("movieId", i.getMovieId(), "movieTitle", i.getMovieTitle(),
                        "rating", i.getRating(), "createdAt", i.getCreatedAt()))
                .toList();
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> rateMovie(@PathVariable String movieId, @RequestBody Map<String, Object> body,
                                       Authentication auth) {
        String userId = auth.getPrincipal().toString();
        var item = new UserItem();
        item.setPk("USER#" + userId);
        item.setSk("RATING#" + movieId);
        item.setMovieId(movieId);
        item.setMovieTitle((String) body.getOrDefault("movieTitle", ""));
        item.setRating(((Number) body.get("rating")).doubleValue());
        item.setCreatedAt(Instant.now().toString());
        table.putItem(item);
        return ResponseEntity.ok(Map.of("status", "rated"));
    }
}
