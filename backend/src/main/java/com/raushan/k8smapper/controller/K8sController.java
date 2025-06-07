package com.raushan.k8smapper.controller;

import com.raushan.k8smapper.model.NamespacedGraphResponse;
import com.raushan.k8smapper.service.K8sTopologyStore;
import com.raushan.k8smapper.service.TopologyBuilderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/topology")
@RequiredArgsConstructor
public class K8sController {

    private final K8sTopologyStore store;
    private final TopologyBuilderService topologyBuilder;

    @GetMapping
    public NamespacedGraphResponse getTopology() {
        return topologyBuilder.buildFromStore(store);
    }

}
