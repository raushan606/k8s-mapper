package com.raushan.k8smapper.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class PodNode extends TopologyNode {
    private List<String> containers;
    private String phase;
    private String nodeName;

    public PodNode() {
        super();
        setType(ResourceType.POD);
    }

    public PodNode(String id, String name, String namespace, List<String> containers, String phase, String nodeName) {
        super(id, name, namespace, ResourceType.POD);
        this.containers = containers;
        this.phase = phase;
        this.nodeName = nodeName;
    }
}
