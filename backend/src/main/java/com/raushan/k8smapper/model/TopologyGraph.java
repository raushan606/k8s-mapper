package com.raushan.k8smapper.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopologyGraph {
    private List<TopologyNode> nodes = new ArrayList<>();
    private List<TopologyEdge> edges = new ArrayList<>();
}