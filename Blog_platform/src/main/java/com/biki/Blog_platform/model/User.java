package com.biki.Blog_platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "blog_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private long id;
    @Column(nullable = false,unique = true,length = 50)
    private String username;
    @Column(nullable = false,unique = true,length = 70)
    private String email;
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role= Role.ROLE_USER;

    @Column(nullable = false,updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private boolean enabled= true;

    @Column(length=30)
    private String provider;
    @Column(length = 100)
    private String providerId;
    @Column(length=500)
    private String avatarUrl;

    @PrePersist
    protected void create(){
        createdAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void update(){
        updatedAt = LocalDateTime.now();
    }

}
