package dev.sandeep.rewatch;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires LocalStack DynamoDB running")
class NotAnotherRewatchApplicationTests {

    @Test
    void contextLoads() {
    }
}
