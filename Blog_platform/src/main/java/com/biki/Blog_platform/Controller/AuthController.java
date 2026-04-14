package com.biki.Blog_platform.Controller;

import com.biki.Blog_platform.DTO.LoginRequest;
import com.biki.Blog_platform.DTO.LoginResponse;
import com.biki.Blog_platform.DTO.RegisterRequest;
import com.biki.Blog_platform.Service.JwtService;
import com.biki.Blog_platform.Service.UserService;
import com.biki.Blog_platform.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")

public class AuthController {
    @Autowired
    private UserService userService;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    private JwtService jwtService;

    private static final String FRONTEND_URL_SESSION_KEY = "oauth2_frontend_url";

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User user = userService.register(request.getUsername(),
                request.getEmail(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.
                authenticate(new UsernamePasswordAuthenticationToken
                        (request.getEmail(), request.getPassword()));
        if (authentication.isAuthenticated()) {
            String token = jwtService.generateToken(Long.valueOf(authentication.getName()));
            return ResponseEntity.ok(new LoginResponse(token));
        } else return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/oauth2/google")
    public void startGoogleOAuth(@RequestParam(required = false) String redirectUri,
                                 HttpServletRequest request,
                                 HttpServletResponse response) throws IOException {
        String frontendUrl = resolveFrontendUrl(redirectUri, request);
        request.getSession(true).setAttribute(FRONTEND_URL_SESSION_KEY, frontendUrl);
        response.sendRedirect("/oauth2/authorization/google");
    }

    private String resolveFrontendUrl(String redirectUri, HttpServletRequest request) {
        if (isAllowedLocalOrigin(redirectUri)) {
            return redirectUri;
        }

        String origin = request.getHeader("Origin");
        if (isAllowedLocalOrigin(origin)) {
            return origin;
        }
        return "http://localhost:5173";
    }

    private boolean isAllowedLocalOrigin(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }
        return url.matches("^http://localhost:\\d+$") || url.matches("^http://127\\.0\\.0\\.1:\\d+$");
    }
}
