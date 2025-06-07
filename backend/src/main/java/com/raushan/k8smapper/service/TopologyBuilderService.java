package com.raushan.k8smapper.service;

import com.raushan.k8smapper.model.IngressNode;
import com.raushan.k8smapper.model.PodNode;
import com.raushan.k8smapper.model.ServiceNode;
import com.raushan.k8smapper.model.TopologyEdge;
import com.raushan.k8smapper.model.TopologyGraph;
import com.raushan.k8smapper.model.TopologyNode;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.networking.v1.HTTPIngressPath;
import io.fabric8.kubernetes.api.model.networking.v1.HTTPIngressRuleValue;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import io.fabric8.kubernetes.api.model.networking.v1.IngressRule;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class TopologyBuilderService {

    public TopologyGraph buildGraph(List<Pod> pods, List<io.fabric8.kubernetes.api.model.Service> services, List<Ingress> ingresses) {
        TopologyGraph graph = new TopologyGraph();
        Map<String, TopologyNode> nodes = new HashMap<>();

        for (Pod pod : pods) {
            String name = pod.getMetadata().getName();
            String ns = pod.getMetadata().getNamespace();
            String id = "pod:" + ns + "/" + name;

            List<String> containers = pod.getSpec().getContainers().stream()
                    .map(Container::getName).toList();

            PodNode podNode = new PodNode(id, name, ns, containers,
                    pod.getStatus().getPhase(), pod.getSpec().getNodeName());

            nodes.put(id, podNode);
        }

        // Add Services
        for (io.fabric8.kubernetes.api.model.Service svc : services) {
            String name = svc.getMetadata().getName();
            String ns = svc.getMetadata().getNamespace();
            String id = "svc:" + ns + "/" + name;

            ServiceNode svcNode = new ServiceNode(id, name, ns,
                    svc.getSpec().getClusterIP(), svc.getSpec().getType());

            nodes.put(id, svcNode);

            // Connect Service to Pods using selector
            Map<String, String> selector = svc.getSpec().getSelector();
            if (selector != null) {
                pods.stream()
                        .filter(p -> ns.equals(p.getMetadata().getNamespace()))
                        .filter(p -> hasLabels(p, selector))
                        .forEach(matchingPod -> {
                            String podId = "pod:" + ns + "/" + matchingPod.getMetadata().getName();
                            graph.getEdges().add(new TopologyEdge(id, podId, "selects"));
                        });
            }
        }

        // Add Ingresses
        for (Ingress ingress : ingresses) {
            String name = ingress.getMetadata().getName();
            String ns = ingress.getMetadata().getNamespace();
            String id = "ing:" + ns + "/" + name;

            List<String> hosts = ingress.getSpec().getRules().stream()
                    .map(IngressRule::getHost).filter(Objects::nonNull).toList();

            IngressNode ingNode = new IngressNode(id, name, ns, hosts);
            nodes.put(id, ingNode);

            // Try to connect to Services in rules
            for (IngressRule rule : ingress.getSpec().getRules()) {
                HTTPIngressRuleValue http = rule.getHttp();
                if (http != null) {
                    for (HTTPIngressPath path : http.getPaths()) {
                        if (path.getBackend() != null) {
                            String svcName = path.getBackend().getService().getName();
                            String svcId = "svc:" + ns + "/" + svcName;
                            if (nodes.containsKey(svcId)) {
                                graph.getEdges().add(new TopologyEdge(id, svcId, "routes-to"));
                            }
                        }
                    }
                }
            }
        }

        graph.getNodes().addAll(nodes.values());
        return graph;
    }

    private boolean hasLabels(Pod pod, Map<String, String> selector) {
        Map<String, String> labels = pod.getMetadata().getLabels();
        if (labels == null) return false;
        return selector.entrySet().stream()
                .allMatch(e -> e.getValue().equals(labels.get(e.getKey())));
    }
}
