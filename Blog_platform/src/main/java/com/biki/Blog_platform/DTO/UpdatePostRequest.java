package com.biki.Blog_platform.DTO;

import com.biki.Blog_platform.model.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePostRequest {
    @NotBlank
    @Size(min = 4,max=200)
    private String title;
    @NotBlank
    private String content;
    private String imageUrl;
    private PostStatus status;
    private List<String> tags;
}
