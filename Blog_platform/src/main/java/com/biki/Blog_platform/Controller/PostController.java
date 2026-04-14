package com.biki.Blog_platform.Controller;

import com.biki.Blog_platform.DTO.CreatePostRequest;
import com.biki.Blog_platform.DTO.UpdatePostRequest;
import com.biki.Blog_platform.Service.FileStorageService;
import com.biki.Blog_platform.Service.JwtService;
import com.biki.Blog_platform.Service.PostService;
import com.biki.Blog_platform.model.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private JwtService jwtService;

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return jwtService.extractUserId(authHeader.substring(7));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> createPost(@RequestBody CreatePostRequest request,
                                           @RequestHeader("Authorization") String authHeader){
        Post post = postService.createPost(extractUserId(authHeader),request);
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @PostMapping("/upload-image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(fileStorageService.saveImage(file));
    }
    @PutMapping("/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> updatePost(@PathVariable Long postId,
                                           @RequestBody UpdatePostRequest request,
                                           @RequestHeader("Authorization") String authHeader){

        return ResponseEntity.ok(postService.updatePost(postId,extractUserId(authHeader),request));
    }
    @DeleteMapping("{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deletePost(@PathVariable Long postId,
                                             @RequestHeader("Authorization") String authHeader){
        postService.deletePost(postId,extractUserId(authHeader));
        return ResponseEntity.ok("Post deleted");
    }

    @PutMapping("/{postId}/publish")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> publishPost(@PathVariable Long postId,
                                            @RequestHeader("Authorization") String authHeader){
        return ResponseEntity.ok(postService.publishPost(postId,extractUserId(authHeader)));
    }
    @PutMapping("/{postId}/draft")
    @PreAuthorize("isAuthenticated")
    public ResponseEntity<Post> saveDraft(@PathVariable Long postId,
                                          @RequestHeader("Authorization") String authHeader){
        return ResponseEntity.ok(postService.saveDraft(postId,extractUserId(authHeader)));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }


    @GetMapping("/search")
    public ResponseEntity<Page<Post>> searchPublishedPost(@RequestParam String keyword,Pageable pageable){
        return ResponseEntity.ok(postService.searchPublishedPosts(keyword,pageable));
    }

    @GetMapping
    public ResponseEntity<Page<Post>> getAllPublishedPosts(Pageable pageable){
        return ResponseEntity.ok(postService.getAllPublishedPosts(pageable));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<Post>> getMyPosts(@RequestHeader("Authorization") String authHeader,
                                                 Pageable pageable){
        return ResponseEntity.ok(postService.getMyPosts(extractUserId(authHeader),pageable));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<Post>> getPostByUsername(@PathVariable String username, Pageable pageable){
        return ResponseEntity.ok(postService.getPostByUsername(username,pageable));
    }

    @GetMapping("/tag/{tagName}")
    public ResponseEntity<Page<Post>> getPostsByTag(@PathVariable String tagName, Pageable pageable){
        return ResponseEntity.ok(postService.getPostsByTag(tagName,pageable));
    }


}
