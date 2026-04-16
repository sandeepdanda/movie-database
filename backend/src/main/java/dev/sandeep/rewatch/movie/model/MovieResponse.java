package dev.sandeep.rewatch.movie.model;

import java.util.List;

/**
 * API response for a single movie with all its details.
 * Assembled from multiple DynamoDB items (metadata + genres + cast + crew).
 */
public record MovieResponse(
        String id,
        String title,
        String overview,
        String releaseDate,
        String releaseYear,
        Long budget,
        Long revenue,
        Double runtime,
        String tagline,
        String status,
        Double voteAvg,
        Long voteCount,
        Double popularity,
        String posterUrl,
        List<Genre> genres,
        List<CastMember> cast,
        List<CrewMember> crew
) {
    public record Genre(Integer id, String name) {}
    public record CastMember(String name, String character, Integer order) {}
    public record CrewMember(String name, String department, String job) {}
}
