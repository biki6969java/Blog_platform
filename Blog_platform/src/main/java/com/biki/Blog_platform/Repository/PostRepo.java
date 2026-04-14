package com.biki.Blog_platform.Repository;

import com.biki.Blog_platform.model.Post;
import com.biki.Blog_platform.model.PostStatus;
import com.biki.Blog_platform.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepo extends JpaRepository<Post,Long> {


    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String title, Long postId);

    Page<Post> findByStatus(PostStatus postStatus, Pageable pageable);

    Page<Post> findByAuthorId(Long userId, Pageable pageable);

    Page<Post> findByAuthorUsernameAndStatus(String username, PostStatus postStatus, Pageable pageable);

    Page<Post> findByTagsNameAndStatus(String tagName, PostStatus postStatus, Pageable pageable);

    Page<Post> findByStatusAndTitleContainingIgnoreCaseOrStatusAndContentContainingIgnoreCase
            (PostStatus postStatus, String keyword, PostStatus postStatus1, String keyword1, Pageable pageable);
    @Query("""
    SELECT p FROM Post p
    WHERE p.status = :status
    AND (
        LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
    )
""")
    public Page<Post> searchPublishedPosts(PostStatus status, String keyword, Pageable pageable);
}
