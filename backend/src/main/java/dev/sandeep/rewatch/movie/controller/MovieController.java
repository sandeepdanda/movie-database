package dev.sandeep.rewatch.movie.controller;

import dev.sandeep.rewatch.movie.model.MovieResponse;
import dev.sandeep.rewatch.movie.model.MovieSummary;
import dev.sandeep.rewatch.movie.service.MovieService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovie(@PathVariable String id) {
        return movieService.getMovieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<MovieSummary> browseMovies(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String decade,
            @RequestParam(required = false, defaultValue = "popularity") String sort,
            @RequestParam(required = false, defaultValue = "20") int limit) {

        if (genre != null) {
            return movieService.getMoviesByGenre(genre, limit);
        }
        if (decade != null) {
            return movieService.getMoviesByDecade(decade, limit);
        }
        if ("rating".equals(sort)) {
            return movieService.getTopRated(limit);
        }
        // Default: top rated
        return movieService.getTopRated(limit);
    }
}
