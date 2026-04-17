package dev.sandeep.rewatch.auth;

import dev.sandeep.rewatch.auth.model.UserItem;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepo, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");
        String password = body.get("password");

        if (email == null || username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email, username, and password required"));
        }

        if (userRepo.findByEmail(email) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        String userId = UUID.randomUUID().toString().substring(0, 8);

        var user = new UserItem();
        user.setPk("USER#" + userId);
        user.setSk("#PROFILE");
        user.setGsi3pk("EMAIL#" + email);
        user.setGsi3sk("USER");
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setCreatedAt(Instant.now().toString());
        userRepo.putItem(user);

        String token = jwtUtil.generateToken(userId, username);
        return ResponseEntity.ok(Map.of("token", token, "userId", userId, "username", username));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        var user = userRepo.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        String userId = user.getPk().substring(5); // strip "USER#"
        String token = jwtUtil.generateToken(userId, user.getUsername());
        return ResponseEntity.ok(Map.of("token", token, "userId", userId, "username", user.getUsername()));
    }
}
