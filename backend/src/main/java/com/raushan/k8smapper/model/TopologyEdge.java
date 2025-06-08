package com.raushan.k8smapper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopologyEdge {
    private String source;
    private String target;
//    private String relation; // e.g., "connects-to", "routes-to"
}
