package dev.sandeep.rewatch.movie.model;

/**
 * Lightweight movie summary for browse/search results.
 * Only includes fields projected into GSIs.
 */
public record MovieSummary(
        String id,
        String title,
        String releaseYear,
        Double voteAvg,
        Double popularity,
        String posterUrl
) {}
