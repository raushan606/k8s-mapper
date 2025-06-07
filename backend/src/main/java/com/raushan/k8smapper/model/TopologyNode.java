package com.raushan.k8smapper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopologyNode {
    private String id;
    private String name;
    private String namespace;
    private ResourceType type; // e.g., Pod, Service, Ingress
}
