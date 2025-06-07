package com.raushan.k8smapper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenericResourceNode {
    private String name;
    private String namespace;
    private ResourceType type; // e.g., ConfigMap, Secret, Deployment
}
