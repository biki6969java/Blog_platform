package com.biki.Blog_platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@Table(name = "tags")
@NoArgsConstructor
@AllArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false,unique = true,length = 50)
    private String name;

    @Column(nullable = false,unique = true,length = 100)
    private String slug;

    @ManyToMany(mappedBy ="tags",fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Post> posts=new HashSet<>();
}
