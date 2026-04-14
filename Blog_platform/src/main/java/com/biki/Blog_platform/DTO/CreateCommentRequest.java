package com.biki.Blog_platform.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotBlank
    private String content;
    private Long parentId;

}
