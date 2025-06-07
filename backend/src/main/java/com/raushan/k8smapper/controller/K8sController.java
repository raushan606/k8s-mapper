package com.raushan.k8smapper.controller;

import com.raushan.k8smapper.model.TopologyGraph;
import com.raushan.k8smapper.service.TopologyBuilderService;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import io.fabric8.kubernetes.client.KubernetesClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/topology")
@RequiredArgsConstructor
public class K8sController {

    private final KubernetesClient client;
    private final TopologyBuilderService topologyBuilder;

    @GetMapping
    public TopologyGraph getTopology() {
        List<Pod> pods = client.pods().inAnyNamespace().list().getItems();
        List<Service> services = client.services().inAnyNamespace().list().getItems();
        List<Ingress> ingresses = client.network().v1().ingresses().inAnyNamespace().list().getItems();

        return topologyBuilder.buildGraph(pods, services, ingresses);
    }

}
