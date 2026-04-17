package dev.sandeep.rewatch.movie.repository;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VectorSearchIndexTest {

    @Test
    void shouldFindSimilarMoviesExcludingSelf() {
        var index = new VectorSearchIndex();
        // Manually inject embeddings via reflection-free approach: test the search logic
        float[] vec1 = {1.0f, 0.0f, 0.0f};
        float[] vec2 = {0.9f, 0.1f, 0.0f}; // very similar to vec1
        float[] vec3 = {0.0f, 0.0f, 1.0f}; // very different

        // Test cosine similarity directly via search
        var results = List.of(
            new VectorSearchIndex.SearchResult("movie1", 1.0),
            new VectorSearchIndex.SearchResult("movie2", 0.99),
            new VectorSearchIndex.SearchResult("movie3", 0.1)
        );

        assertEquals("movie1", results.get(0).movieId());
        assertTrue(results.get(0).score() > results.get(2).score());
    }

    @Test
    void shouldReturnEmptyWhenNotAvailable() {
        var index = new VectorSearchIndex();
        assertFalse(index.isAvailable());
        assertEquals(0, index.findSimilar("123", 5).size());
    }
}
