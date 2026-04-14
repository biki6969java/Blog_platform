package com.biki.Blog_platform.Controller;

import com.biki.Blog_platform.DTO.ChangePasswordRequest;
import com.biki.Blog_platform.DTO.DeleteAccountRequest;
import com.biki.Blog_platform.DTO.UpdateEmailRequest;
import com.biki.Blog_platform.DTO.UpdateUserRequest;
import com.biki.Blog_platform.Service.JwtService;
import com.biki.Blog_platform.Service.UserService;
import com.biki.Blog_platform.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/users")
public class UserController {
    @Autowired
    private UserService service;
    @Autowired
    private JwtService jwtService;

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return jwtService.extractUserId(authHeader.substring(7));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        User user = service.findById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateMyProfile(@RequestBody UpdateUserRequest request,
                                                @RequestHeader("Authorization") String authHeader){
        return ResponseEntity.ok(service.updateMyProfile(extractUserId(authHeader),
                request.getUsername()));
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> changeMyPassword(@RequestBody ChangePasswordRequest request,
                                                   @RequestHeader("Authorization") String authHeader){
        service.ChangePassword(extractUserId(authHeader), request.getOldPassword()
                ,request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }
    @PutMapping("/me/email")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateEmail(@RequestBody UpdateEmailRequest request,
                                            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(service.updateEmail(extractUserId(authHeader), request.getNewEmail()));
    }


    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> DeleteMyAccount(@RequestBody DeleteAccountRequest request,
                                                  @RequestHeader("Authorization") String authHeader){
        service.deleteMyAccount(extractUserId(authHeader)
        ,request.getPassword());
        return ResponseEntity.ok("Account Deleted");
    }



    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUSers() {
        return ResponseEntity.ok(service.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getUserById(id));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(service.getByUsername(username));
    }

    @GetMapping("/search")
    public  ResponseEntity<List<User>> searchUsers(@RequestParam String keyword){
        return ResponseEntity.ok(service.searchUsername(keyword));
    }

    @PutMapping("/{id}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> setEnable(@PathVariable("id") Long id, @RequestParam("enabled") boolean enabled){
        return ResponseEntity.ok(service.setEnabled(id,enabled));
    }
    @PutMapping("/{id}/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> promoteUser(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.promoteUser(id));
    }

    @PutMapping("/{id}/demote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> demoteUser(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.demoteUser(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable("id") Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }
    

}
