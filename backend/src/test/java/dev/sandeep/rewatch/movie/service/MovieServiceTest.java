package dev.sandeep.rewatch.movie.service;

import dev.sandeep.rewatch.movie.model.MovieCatalogItem;
import dev.sandeep.rewatch.movie.model.MovieSummary;
import dev.sandeep.rewatch.movie.repository.MovieRepository;
import dev.sandeep.rewatch.movie.repository.TitleSearchIndex;
import dev.sandeep.rewatch.movie.repository.VectorSearchIndex;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock private MovieRepository repository;
    @Mock private TitleSearchIndex searchIndex;
    @Mock private VectorSearchIndex vectorIndex;

    private MovieService service;

    @BeforeEach
    void setUp() {
        service = new MovieService(repository, searchIndex, vectorIndex);
    }

    @Test
    void shouldReturnTopRatedMovies() {
        var item = new MovieCatalogItem();
        item.setPk("MOVIE#123");
        item.setTitle("Test Movie");
        item.setReleaseYear("2024");
        item.setVoteAvg(8.5);
        item.setPopularity(50.0);

        when(repository.getTopRated(10)).thenReturn(List.of(item));

        List<MovieSummary> results = service.getTopRated(10);

        assertEquals(1, results.size());
        assertEquals("Test Movie", results.get(0).title());
        assertEquals(8.5, results.get(0).voteAvg());
    }

    @Test
    void shouldFallbackToTitleSearchWhenVectorUnavailable() {
        when(vectorIndex.isAvailable()).thenReturn(false);

        var entry = new TitleSearchIndex.TitleEntry("123", "Interstellar", "2014", 8.3, 32.0, null);
        when(searchIndex.search("space", 5)).thenReturn(List.of(entry));

        List<MovieSummary> results = service.semanticSearch("space", 5);

        assertEquals(1, results.size());
        assertEquals("Interstellar", results.get(0).title());
        verify(vectorIndex, never()).search(any(), anyInt());
    }

    @Test
    void shouldReturnEmptyForUnknownMovie() {
        when(repository.getMovieById("999")).thenReturn(List.of());

        var result = service.getMovieById("999");

        assertTrue(result.isEmpty());
    }
}
