package com.raushan.k8smapper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopologyEdge {
    private String fromId;
    private String toId;
    private String label; // e.g., "connects-to", "routes-to"
}
