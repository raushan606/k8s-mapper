package com.raushan.k8smapper.service;

import com.raushan.k8smapper.model.ResourceType;
import com.raushan.k8smapper.model.TopologyEdge;
import com.raushan.k8smapper.model.TopologyGraph;
import com.raushan.k8smapper.model.TopologyNode;
import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.OwnerReference;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.api.model.Volume;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.networking.v1.HTTPIngressPath;
import io.fabric8.kubernetes.api.model.networking.v1.HTTPIngressRuleValue;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import io.fabric8.kubernetes.api.model.networking.v1.IngressRule;
import io.fabric8.kubernetes.client.KubernetesClient;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TopologyBuilderService {

    public TopologyGraph buildGraph(K8sTopologyStore store) {
        TopologyGraph graph = new TopologyGraph();

        Map<String, TopologyNode> nodeMap = getTopologyNodeMap(store);

        graph.getNodes().addAll(nodeMap.values());

        // ---------------- Edges ----------------

        // Deployment ➝ Pod (via ownerReference)
        for (Pod pod : store.getPods().values()) {
            if (pod.getMetadata().getOwnerReferences() != null) {
                for (OwnerReference owner : pod.getMetadata().getOwnerReferences()) {
                    if ("Deployment".equals(owner.getKind())) {
                        String fromId = "deployment:" + owner.getUid();
                        String toId = "pod:" + pod.getMetadata().getUid();
                        graph.getEdges().add(new TopologyEdge(fromId, toId, "controls"));
                    }
                }
            }
        }

        // Service ➝ Pod (via label selectors)
        for (io.fabric8.kubernetes.api.model.Service svc : store.getServices().values()) {
            Map<String, String> selector = svc.getSpec().getSelector();
            if (selector != null && !selector.isEmpty()) {
                for (Pod pod : store.getPods().values()) {
                    Map<String, String> labels = pod.getMetadata().getLabels();
                    if (labels != null && labels.entrySet().containsAll(selector.entrySet())) {
                        String fromId = "service:" + svc.getMetadata().getUid();
                        String toId = "pod:" + pod.getMetadata().getUid();
                        graph.getEdges().add(new TopologyEdge(fromId, toId, "routes-to"));
                    }
                }
            }
        }

        // Ingress ➝ Service (via backend service name)
        for (Ingress ing : store.getIngresses().values()) {
            List<IngressRule> rules = ing.getSpec().getRules();
            if (rules != null) {
                for (IngressRule rule : rules) {
                    HTTPIngressRuleValue http = rule.getHttp();
                    if (http != null && http.getPaths() != null) {
                        for (HTTPIngressPath path : http.getPaths()) {
                            if (path.getBackend() != null && path.getBackend().getService() != null) {
                                String svcName = path.getBackend().getService().getName();
                                String ns = ing.getMetadata().getNamespace();

                                Optional<io.fabric8.kubernetes.api.model.Service> svc = store.getServices().values().stream()
                                        .filter(s -> s.getMetadata().getName().equals(svcName) &&
                                                s.getMetadata().getNamespace().equals(ns))
                                        .findFirst();

                                svc.ifPresent(service -> graph.getEdges().add(new TopologyEdge(
                                        "ingress:" + ing.getMetadata().getUid(),
                                        "service:" + service.getMetadata().getUid(),
                                        "routes-to"
                                )));
                            }
                        }
                    }
                }
            }
        }

        // Pod ➝ ConfigMap / Secret (via envFrom, volumes)
        for (Pod pod : store.getPods().values()) {
            String podId = "pod:" + pod.getMetadata().getUid();

            if (pod.getSpec() != null) {
                List<Volume> volumes = pod.getSpec().getVolumes();
                if (volumes != null) {
                    for (Volume vol : volumes) {
                        if (vol.getConfigMap() != null) {
                            String name = vol.getConfigMap().getName();
                            String ns = pod.getMetadata().getNamespace();
                            Optional<ConfigMap> cm = store.getConfigMaps().values().stream()
                                    .filter(c -> c.getMetadata().getName().equals(name) && c.getMetadata().getNamespace().equals(ns))
                                    .findFirst();

                            cm.ifPresent(configMap -> graph.getEdges().add(new TopologyEdge(
                                    podId,
                                    "configmap:" + configMap.getMetadata().getUid(),
                                    "uses"
                            )));
                        }

                        if (vol.getSecret() != null) {
                            String name = vol.getSecret().getSecretName();
                            String ns = pod.getMetadata().getNamespace();
                            Optional<Secret> sec = store.getSecrets().values().stream()
                                    .filter(s -> s.getMetadata().getName().equals(name) && s.getMetadata().getNamespace().equals(ns))
                                    .findFirst();

                            sec.ifPresent(secret -> graph.getEdges().add(new TopologyEdge(
                                    podId,
                                    "secret:" + secret.getMetadata().getUid(),
                                    "uses"
                            )));
                        }
                    }
                }
            }
        }

        return graph;
    }

    @NotNull
    private static Map<String, TopologyNode> getTopologyNodeMap(K8sTopologyStore store) {
        Map<String, TopologyNode> nodeMap = new HashMap<>();

        // ---------------- Nodes ----------------

        for (Deployment dep : store.getDeployments().values()) {
            TopologyNode node = new TopologyNode(
                    "deployment:" + dep.getMetadata().getUid(),
                    dep.getMetadata().getName(),
                    dep.getMetadata().getNamespace(),
                    ResourceType.DEPLOYMENT
            );
            nodeMap.put(node.getId(), node);
        }

        for (Pod pod : store.getPods().values()) {
            TopologyNode node = new TopologyNode(
                    "pod:" + pod.getMetadata().getUid(),
                    pod.getMetadata().getName(),
                    pod.getMetadata().getNamespace(),
                    ResourceType.POD
            );
            nodeMap.put(node.getId(), node);
        }

        for (io.fabric8.kubernetes.api.model.Service svc : store.getServices().values()) {
            TopologyNode node = new TopologyNode(
                    "service:" + svc.getMetadata().getUid(),
                    svc.getMetadata().getName(),
                    svc.getMetadata().getNamespace(),
                    ResourceType.SERVICE
            );
            nodeMap.put(node.getId(), node);
        }

        for (Ingress ing : store.getIngresses().values()) {
            TopologyNode node = new TopologyNode(
                    "ingress:" + ing.getMetadata().getUid(),
                    ing.getMetadata().getName(),
                    ing.getMetadata().getNamespace(),
                    ResourceType.INGRESS
            );
            nodeMap.put(node.getId(), node);
        }

        for (ConfigMap cm : store.getConfigMaps().values()) {
            TopologyNode node = new TopologyNode(
                    "configmap:" + cm.getMetadata().getUid(),
                    cm.getMetadata().getName(),
                    cm.getMetadata().getNamespace(),
                    ResourceType.CONFIGMAP
            );
            nodeMap.put(node.getId(), node);
        }

        for (Secret secret : store.getSecrets().values()) {
            TopologyNode node = new TopologyNode(
                    "secret:" + secret.getMetadata().getUid(),
                    secret.getMetadata().getName(),
                    secret.getMetadata().getNamespace(),
                    ResourceType.SECRETS
            );
            nodeMap.put(node.getId(), node);
        }
        return nodeMap;
    }
}
