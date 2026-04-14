package com.biki.Blog_platform.Service;

import com.biki.Blog_platform.DTO.CommentResponseDto;
import com.biki.Blog_platform.DTO.CreateCommentRequest;
import com.biki.Blog_platform.DTO.UpdateCommentRequest;
import com.biki.Blog_platform.ExceptionHandling.ResourceNotFoundException;
import com.biki.Blog_platform.Repository.CommentRepo;
import com.biki.Blog_platform.Repository.PostRepo;
import com.biki.Blog_platform.Repository.UserRepo;
import com.biki.Blog_platform.model.Comment;
import com.biki.Blog_platform.model.Post;
import com.biki.Blog_platform.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private UserRepo userRepo;

    public Comment addComment(Long postId, Long userId, CreateCommentRequest request) {
        Post post = postRepo.findById(postId).orElseThrow(() ->
                new ResourceNotFoundException("Post not found with id: " + postId));

        User author = userRepo.findById(userId).orElseThrow(() ->
                new ResourceNotFoundException("User not found with id: " + userId));

        Comment parent = null;

        if (request.getParentId() != null) {
            parent = commentRepo.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Parent comment not found with id: " + request.getParentId()
                    ));

            if (!parent.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Reply comment must belong to same post");
            }
        }

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setParent(parent);

        return commentRepo.save(comment);
    }
    private Comment getCommentById(Long commentId) {
        return commentRepo.findById(commentId).orElseThrow(()->
                new ResourceNotFoundException("Comment not found with this id : " + commentId));
    }

    public Comment editComment(Long commentId, Long userId, UpdateCommentRequest request){
        Comment comment = getCommentById(commentId);
        if(comment.getAuthor().getId()!=userId){
            throw new IllegalArgumentException("You can update your own comment!");
        }
        comment.setContent(request.getContent());
        comment.setEdited(true);
        return commentRepo.save(comment);
    }

    public void deleteComment(Long commentId,Long userId){
        Comment comment = getCommentById(commentId);
        if(comment.getAuthor().getId()!=userId){
            throw new IllegalArgumentException("You can delete your own comment!");
        }

        comment.setDeleted(true);
        comment.setContent("This comment is deleted");
        commentRepo.save(comment);
    }

    public void deleteAnyComment(Long commentId) {
        Comment comment = getCommentById(commentId);
        comment.setDeleted(true);
        comment.setContent("This comment was deleted");
        commentRepo.save(comment);
    }

    @Transactional(readOnly = true)
    public Page<CommentResponseDto> getCommentsByPost(Long postId, Pageable pageable){
            if(!postRepo.existsById(postId)){
                throw  new ResourceNotFoundException("No post with this id : " + postId);
            }
            return commentRepo.findByPostIdAndParentIsNullAndDeletedFalse(postId,pageable)
                    .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<Comment> getMyComments(Long userId,Pageable pageable){
        return commentRepo.findByAuthorIdAndDeletedFalse(userId,pageable);
    }

    public CommentResponseDto mapToDto(Comment comment) {
        return new CommentResponseDto(
                comment.getId(),
                comment.getContent(),
                comment.getAuthor().getUsername(),
                comment.getPost().getId(),
                comment.getParent() != null ? comment.getParent().getId() : null,
                comment.isEdited(),
                comment.isDeleted(),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                comment.getReplies().stream()
                        .filter(reply -> !reply.isDeleted())
                        .map(this::mapToDto)
                        .collect(Collectors.toList())
        );
    }
}
