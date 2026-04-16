package dev.sandeep.rewatch.movie.controller;

import dev.sandeep.rewatch.movie.model.MovieSummary;
import dev.sandeep.rewatch.movie.service.MovieService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final MovieService movieService;
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    public ChatController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "");
        var emitter = new SseEmitter(30_000L);

        executor.execute(() -> {
            try {
                List<MovieSummary> movies = movieService.semanticSearch(message, 5);

                // Stream the response token-by-token to simulate LLM streaming
                String response = buildResponse(message, movies);
                for (String word : response.split("(?<=\\s)")) {
                    emitter.send(SseEmitter.event().data(word));
                    Thread.sleep(30);
                }

                // Send movie cards as structured data
                if (!movies.isEmpty()) {
                    emitter.send(SseEmitter.event().name("movies").data(movies));
                }

                emitter.send(SseEmitter.event().name("done").data(""));
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private String buildResponse(String query, List<MovieSummary> movies) {
        if (movies.isEmpty()) {
            return "I couldn't find any movies matching that. Try a different description!";
        }

        var sb = new StringBuilder();
        sb.append("Based on \"").append(query).append("\", here are my picks:\n\n");

        for (int i = 0; i < movies.size(); i++) {
            var m = movies.get(i);
            sb.append(i + 1).append(". **").append(m.title()).append("**");
            sb.append(" (").append(m.releaseYear()).append(")");
            sb.append(" — ⭐ ").append(m.voteAvg());
            sb.append("\n");
        }

        sb.append("\nWant me to find something more specific? ");
        sb.append("Try describing the mood, genre, or themes you're looking for.");
        return sb.toString();
    }
}
