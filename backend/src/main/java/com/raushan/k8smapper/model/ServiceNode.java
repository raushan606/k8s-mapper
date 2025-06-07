package com.raushan.k8smapper.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ServiceNode extends TopologyNode {
    private String clusterIP;
    private ResourceType type;

    public ServiceNode() {
        super();
        setType(ResourceType.SERVICE);
    }

    public ServiceNode(String id, String name, String namespace, String clusterIP, ResourceType type) {
        super(id, name, namespace, ResourceType.SERVICE);
        this.clusterIP = clusterIP;
        this.type = type;
    }
}
