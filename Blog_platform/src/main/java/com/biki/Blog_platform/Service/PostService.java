package com.biki.Blog_platform.Service;

import com.biki.Blog_platform.DTO.CreatePostRequest;
import com.biki.Blog_platform.DTO.PostResponse;
import com.biki.Blog_platform.DTO.UpdatePostRequest;
import com.biki.Blog_platform.ExceptionHandling.ResourceNotFoundException;
import com.biki.Blog_platform.Repository.CommentRepo;
import com.biki.Blog_platform.Repository.PostRepo;
import com.biki.Blog_platform.Repository.TagRepo;
import com.biki.Blog_platform.Repository.UserRepo;
import com.biki.Blog_platform.model.Post;
import com.biki.Blog_platform.model.PostStatus;
import com.biki.Blog_platform.model.Tag;
import com.biki.Blog_platform.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostService {
    @Autowired
    private PostRepo postRepo;
    @Autowired
    private TagRepo tagRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private CommentRepo commentRepo;

    public Post createPost(Long userId, CreatePostRequest request){
        User author= userRepo.findById(userId).orElseThrow(()->
                new ResourceNotFoundException("User not found with id: " + userId));
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setSlug(generateUniqueSlug(request.getTitle()));
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());
        post.setStatus(request.getStatus()!=null?request.getStatus() : PostStatus.DRAFT);
        post.setAuthor(author);
        post.setTags(resolveTags(request.getTags()));
        
        return postRepo.save(post);

    }


    public Post updatePost(Long postId,Long userId,UpdatePostRequest request){
        Post post = getPostById(postId);
        if(post.getAuthor().getId()!=userId){
            throw new IllegalArgumentException("You can update only your post");
        }
        post.setTitle(request.getTitle());
        post.setSlug(generateUniquePostSlugForUpdate(request.getTitle(),post.getId()));
        post.setContent(request.getContent());
        post.setImageUrl(request.getImageUrl());
        post.setStatus(request.getStatus()!=null?request.getStatus() : PostStatus.DRAFT);
        post.setTags(resolveTags(request.getTags()));
        return postRepo.save(post);
    }

    public void deletePost(Long postId,Long userId){
        Post post = getPostById(postId);
        if(post.getAuthor().getId()!=userId){
            throw new IllegalArgumentException("cannot delete");
        }
         postRepo.delete(post);
    }

    public Post publishPost(Long postId,Long userId){
        Post post = getPostById(postId);
        if(post.getAuthor().getId()!=userId){
            throw new IllegalArgumentException("You can publish only your post");
        }
        post.setStatus(PostStatus.PUBLISHED);
        return postRepo.save(post);
    }

    public Post saveDraft(Long postId,Long userId){
        Post post = getPostById(postId);
        if(post.getAuthor().getId()!=userId){
            throw new IllegalArgumentException("Cannot draft");
        }
        post.setStatus(PostStatus.DRAFT);
        return postRepo.save(post);
    }

//    @Transactional(readOnly = true)
//    public Page<Post> searchPublishedPosts(String keyword, Pageable pageable) {
//        return postRepo.findByStatusAndTitleContainingIgnoreCaseOrStatusAndContentContainingIgnoreCase(
//                PostStatus.PUBLISHED, keyword,
//                PostStatus.PUBLISHED, keyword,
//                pageable
//        );
//    }

    @Transactional(readOnly = true)
    public Page<Post> searchPublishedPosts(String keyword, Pageable pageable) {
        return postRepo.searchPublishedPosts(PostStatus.PUBLISHED, keyword, pageable);
    }


    @Transactional(readOnly = true)
    public Post getPostById(Long postId){
        return  postRepo.findById(postId).orElseThrow(() ->
                new ResourceNotFoundException("Post not found with id: " + postId));
    }

    @Transactional(readOnly = true)
    public Page<Post> getAllPublishedPosts(Pageable pageable){
        return postRepo.findByStatus(PostStatus.PUBLISHED,pageable);
    }
    @Transactional(readOnly = true)
    public Page<Post> getMyPosts(Long userId, Pageable pageable){
        return postRepo.findByAuthorId(userId,pageable);
    }
    @Transactional(readOnly = true)
    public Page<Post> getPostByUsername(String username,Pageable pageable){
        return postRepo.findByAuthorUsernameAndStatus(username,PostStatus.PUBLISHED,pageable);
    }
    @Transactional(readOnly = true)
    public Page<Post> getPostsByTag(String tagName, Pageable pageable){
        return postRepo.findByTagsNameAndStatus(tagName,PostStatus.PUBLISHED,pageable);
    }

    private Set<Tag> resolveTags(java.util.List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();

        if (tagNames == null || tagNames.isEmpty()) {
            return tags;
        }

        for (String tagName : tagNames) {
            String cleanedName = tagName.trim();
            String slug = slugify(cleanedName);

            Tag tag = tagRepo.findBySlug(slug)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(cleanedName);
                        newTag.setSlug(slug);
                        return tagRepo.save(newTag);
                    });

            tags.add(tag);
        }

        return tags;
    }


    private String generateUniqueSlug( String title) {
        String baseSlug= slugify(title);
        String slug  =baseSlug;
                int count = 1;
        while(postRepo.existsBySlug(slug)){
            slug=baseSlug+"-"+count;
            count++;
        }
        return slug;
    }
    private String generateUniquePostSlugForUpdate(String title, Long postId) {
        String baseSlug = slugify(title);
        String slug = baseSlug;
        int count = 1;

        while (postRepo.existsBySlugAndIdNot(slug, postId)) {
            slug = baseSlug + "-" + count;
            count++;
        }

        return slug;
    }


    private String slugify(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be null or blank");
        }

        String slug = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[^\\w\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .toLowerCase(Locale.ROOT);

        return slug.replaceAll("-+", "-");
    }

    public PostResponse mapToDto(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getContent(),
                post.getImageUrl(),
                post.getStatus(),
                post.getAuthor().getUsername(),
                post.getTags().stream()
                        .map(Tag::getName)
                        .collect(Collectors.toList()),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }


}
