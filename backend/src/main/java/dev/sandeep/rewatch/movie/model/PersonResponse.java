package dev.sandeep.rewatch.movie.model;

import java.util.List;

public record PersonResponse(
        String id,
        String name,
        List<MovieSummary> filmography
) {}
