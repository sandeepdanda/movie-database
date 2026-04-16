package dev.sandeep.rewatch.movie.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Genre list endpoint. Genres are static (defined by TMDB) so we hardcode them
 * rather than scanning DynamoDB. The dataset has exactly these 20 genres.
 */
@RestController
@RequestMapping("/api/v1/genres")
public class GenreController {

    private static final List<String> GENRES = List.of(
            "Action", "Adventure", "Animation", "Comedy", "Crime",
            "Documentary", "Drama", "Family", "Fantasy", "Foreign",
            "History", "Horror", "Music", "Mystery", "Romance",
            "Science Fiction", "TV Movie", "Thriller", "War", "Western"
    );

    @GetMapping
    public List<String> listGenres() {
        return GENRES;
    }
}
