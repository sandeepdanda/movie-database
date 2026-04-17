package dev.sandeep.rewatch.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil("test-secret-key-that-is-at-least-32-characters-long");
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = jwtUtil.generateToken("user123", "sandeep");
        assertTrue(jwtUtil.isValid(token));
        assertEquals("user123", jwtUtil.getUserId(token));
    }

    @Test
    void shouldRejectInvalidToken() {
        assertFalse(jwtUtil.isValid("garbage.token.here"));
    }

    @Test
    void shouldRejectTamperedToken() {
        String token = jwtUtil.generateToken("user123", "sandeep");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";
        assertFalse(jwtUtil.isValid(tampered));
    }
}
