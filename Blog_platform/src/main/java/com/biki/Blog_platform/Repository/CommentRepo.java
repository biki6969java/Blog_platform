package com.biki.Blog_platform.Repository;

import com.biki.Blog_platform.model.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommentRepo extends JpaRepository<Comment, Long> {

    Page<Comment> findByPostIdAndParentIsNullAndDeletedFalse(Long postId, Pageable pageable);

    @Query("""
    SELECT c FROM Comment c
    WHERE c.post.id = :postId
    AND c.parent IS NULL
    AND c.deleted = false
""")
    Page<Comment> findByPostId(Long postId,Pageable pageable);

    Page<Comment> findByAuthorIdAndDeletedFalse(Long authorId, Pageable pageable);

    Page<Comment> findByAuthorId(Long userId, Pageable pageable);

}
