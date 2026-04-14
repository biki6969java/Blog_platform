package com.biki.Blog_platform.Controller;

import com.biki.Blog_platform.DTO.CommentResponseDto;
import com.biki.Blog_platform.DTO.CreateCommentRequest;
import com.biki.Blog_platform.DTO.UpdateCommentRequest;
import com.biki.Blog_platform.Service.CommentService;
import com.biki.Blog_platform.Service.JwtService;
import com.biki.Blog_platform.model.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;
    @Autowired
    private JwtService jwtService;

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return jwtService.extractUserId(authHeader.substring(7));
    }

    @PostMapping("/post/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponseDto> addComment(@PathVariable Long postId,
                                                         @RequestBody CreateCommentRequest request,
                                                         @RequestHeader("Authorization") String authHeader){
        Comment comment = commentService.addComment(postId,extractUserId(authHeader),request);
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.mapToDto(comment));
    }

    @PutMapping("{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CommentResponseDto> editComment(@PathVariable Long commentId,
                                                          @RequestHeader("Authorization") String authHeader,
                                                          @RequestBody UpdateCommentRequest request){
     Comment comment = commentService.editComment(commentId,extractUserId(authHeader),request);
     return ResponseEntity.ok(commentService.mapToDto(comment));
    }

    @DeleteMapping("{commentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteComment(@PathVariable Long commentId,
                                                @RequestHeader("Authorization") String authHeader){
        commentService.deleteComment(commentId,extractUserId(authHeader));
        return ResponseEntity.ok("Comment deleted successfully!!");
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<Page<CommentResponseDto>> getCommentsByPost(@PathVariable Long postId, Pageable pageable){
        return ResponseEntity.ok(commentService.getCommentsByPost(postId,pageable));
    }

    @GetMapping("/post/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<CommentResponseDto>> getMyComments(@RequestHeader("Authorization") String authHeader,
                                                                  Pageable pageable){
        return ResponseEntity.ok(commentService.getMyComments(extractUserId(authHeader),pageable).map(commentService::mapToDto));
    }
    @DeleteMapping("/admin/{commentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteAnyComment(@PathVariable Long commentId) {
        commentService.deleteAnyComment(commentId);
        return ResponseEntity.ok("Comment deleted by admin");
    }


}
