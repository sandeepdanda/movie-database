package dev.sandeep.rewatch.movie.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

/**
 * Maps to any item in the MovieCatalog single-table.
 * The PK/SK pattern determines the entity type:
 *   PK=MOVIE#id, SK=#METADATA     → movie
 *   PK=MOVIE#id, SK=GENRE#name    → genre mapping
 *   PK=MOVIE#id, SK=CAST#order#id → cast member
 *   PK=MOVIE#id, SK=CREW#dept#id  → crew member
 */
@DynamoDbBean
public class MovieCatalogItem {

    private String pk;
    private String sk;

    // Common fields (projected into GSIs)
    private String title;
    private String releaseYear;
    private Double voteAvg;
    private Double popularity;
    private String posterUrl;

    // Metadata fields
    private String overview;
    private String releaseDate;
    private Long budget;
    private Long revenue;
    private Double runtime;
    private String tagline;
    private String status;
    private Long voteCount;

    // Genre fields
    private Integer genreId;
    private String genreName;

    // Cast fields
    private String personName;
    private String character;
    private Integer castOrder;

    // Crew fields
    private String department;
    private String job;

    // GSI keys
    private String gsi1pk;
    private String gsi1sk;
    private String gsi2pk;
    private String gsi2sk;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("PK")
    public String getPk() { return pk; }
    public void setPk(String pk) { this.pk = pk; }

    @DynamoDbSortKey
    @DynamoDbAttribute("SK")
    public String getSk() { return sk; }
    public void setSk(String sk) { this.sk = sk; }

    @DynamoDbSecondaryPartitionKey(indexNames = "GSI1-EntityLookup")
    @DynamoDbAttribute("GSI1PK")
    public String getGsi1pk() { return gsi1pk; }
    public void setGsi1pk(String gsi1pk) { this.gsi1pk = gsi1pk; }

    @DynamoDbSecondarySortKey(indexNames = "GSI1-EntityLookup")
    @DynamoDbAttribute("GSI1SK")
    public String getGsi1sk() { return gsi1sk; }
    public void setGsi1sk(String gsi1sk) { this.gsi1sk = gsi1sk; }

    @DynamoDbSecondaryPartitionKey(indexNames = "GSI2-RatingSort")
    @DynamoDbAttribute("GSI2PK")
    public String getGsi2pk() { return gsi2pk; }
    public void setGsi2pk(String gsi2pk) { this.gsi2pk = gsi2pk; }

    @DynamoDbSecondarySortKey(indexNames = "GSI2-RatingSort")
    @DynamoDbAttribute("GSI2SK")
    public String getGsi2sk() { return gsi2sk; }
    public void setGsi2sk(String gsi2sk) { this.gsi2sk = gsi2sk; }

    // Common getters/setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getReleaseYear() { return releaseYear; }
    public void setReleaseYear(String releaseYear) { this.releaseYear = releaseYear; }
    public Double getVoteAvg() { return voteAvg; }
    public void setVoteAvg(Double voteAvg) { this.voteAvg = voteAvg; }
    public Double getPopularity() { return popularity; }
    public void setPopularity(Double popularity) { this.popularity = popularity; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    // Metadata getters/setters
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
    public Long getBudget() { return budget; }
    public void setBudget(Long budget) { this.budget = budget; }
    public Long getRevenue() { return revenue; }
    public void setRevenue(Long revenue) { this.revenue = revenue; }
    public Double getRuntime() { return runtime; }
    public void setRuntime(Double runtime) { this.runtime = runtime; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getVoteCount() { return voteCount; }
    public void setVoteCount(Long voteCount) { this.voteCount = voteCount; }

    // Genre getters/setters
    public Integer getGenreId() { return genreId; }
    public void setGenreId(Integer genreId) { this.genreId = genreId; }
    public String getGenreName() { return genreName; }
    public void setGenreName(String genreName) { this.genreName = genreName; }

    // Cast getters/setters
    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }
    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }
    public Integer getCastOrder() { return castOrder; }
    public void setCastOrder(Integer castOrder) { this.castOrder = castOrder; }

    // Crew getters/setters
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getJob() { return job; }
    public void setJob(String job) { this.job = job; }
}
