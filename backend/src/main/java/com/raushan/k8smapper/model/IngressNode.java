package com.raushan.k8smapper.model;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
public class IngressNode extends TopologyNode {
    private List<String> hosts;

    public IngressNode() {
        super();
        setType(ResourceType.INGRESS);
    }

    public IngressNode(String id, String name, String namespace, List<String> hosts) {
        super(id, name, namespace, ResourceType.INGRESS);
        this.hosts = hosts;
    }
}
