package com.raushan.k8smapper.service;

import com.raushan.k8smapper.model.NamespaceGraph;
import com.raushan.k8smapper.model.NamespacedGraphResponse;
import com.raushan.k8smapper.model.ResourceType;
import com.raushan.k8smapper.model.TopologyEdge;
import com.raushan.k8smapper.model.TopologyNode;
import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.EnvFromSource;
import io.fabric8.kubernetes.api.model.OwnerReference;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.api.model.Volume;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.ReplicaSet;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

@Service
public class TopologyBuilderService {
    public NamespacedGraphResponse buildFromStore(K8sTopologyStore store) {
        Map<String, NamespaceGraph> nsGraphs = new HashMap<>();

        Set<String> allNamespaces = new HashSet<>();
        allNamespaces.addAll(store.getServicesByNamespace().keySet());
        allNamespaces.addAll(store.getPodsByNamespace().keySet());
        allNamespaces.addAll(store.getDeploymentsByNamespace().keySet());
        allNamespaces.addAll(store.getReplicaSetsByNamespace().keySet());
        allNamespaces.addAll(store.getConfigMapsByNamespace().keySet());
        allNamespaces.addAll(store.getSecretsByNamespace().keySet());
        allNamespaces.addAll(store.getIngressesByNamespace().keySet());

        for (String namespace : allNamespaces) {
            NamespaceGraph nsGraph = new NamespaceGraph();

            Map<String, TopologyNode> nodes = new HashMap<>();
            List<TopologyEdge> edges = new ArrayList<>();

            // Helper to create node ID with type prefix
            Function<String, String> serviceId = uid -> "service:" + uid;
            Function<String, String> podId = uid -> "pod:" + uid;
            Function<String, String> deploymentId = uid -> "deployment:" + uid;
            Function<String, String> rsId = uid -> "replicaset:" + uid;
            Function<String, String> cmId = uid -> "configmap:" + uid;
            Function<String, String> secretId = uid -> "secret:" + uid;
            Function<String, String> ingressId = uid -> "ingress:" + uid;

            // Add all resources as nodes

            // Services
            Map<String, io.fabric8.kubernetes.api.model.Service> services = store.getServicesByNamespace().getOrDefault(namespace, Collections.emptyMap());
            services.forEach((name, svc) -> {
                String id = serviceId.apply(svc.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.SERVICE));
            });

            // Deployments
            Map<String, Deployment> deployments = store.getDeploymentsByNamespace().getOrDefault(namespace, Collections.emptyMap());
            deployments.forEach((name, dep) -> {
                String id = deploymentId.apply(dep.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.DEPLOYMENT));
            });

            // ReplicaSets
            Map<String, ReplicaSet> replicaSets = store.getReplicaSetsByNamespace().getOrDefault(namespace, Collections.emptyMap());
            replicaSets.forEach((name, rs) -> {
                String id = rsId.apply(rs.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.REPLICASET));
            });

            // Pods
            Map<String, Pod> pods = store.getPodsByNamespace().getOrDefault(namespace, Collections.emptyMap());
            pods.forEach((name, pod) -> {
                String id = podId.apply(pod.getMetadata().getUid());
                nodes.putIfAbsent(id, new TopologyNode(id, name, namespace, ResourceType.POD));
            });

            // ConfigMaps
            Map<String, ConfigMap> configMaps = store.getConfigMapsByNamespace().getOrDefault(namespace, Collections.emptyMap());
            configMaps.forEach((name, cm) -> {
                String id = cmId.apply(cm.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.CONFIGMAP));
            });

            // Secrets
            Map<String, Secret> secrets = store.getSecretsByNamespace().getOrDefault(namespace, Collections.emptyMap());
            secrets.forEach((name, sec) -> {
                String id = secretId.apply(sec.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.SECRETS));
            });

            // Ingresses
            Map<String, Ingress> ingresses = store.getIngressesByNamespace().getOrDefault(namespace, Collections.emptyMap());
            ingresses.forEach((name, ing) -> {
                String id = ingressId.apply(ing.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.INGRESS));
            });

            // Now add edges

            // 1. Service -> Pod (via selector)
            services.forEach((name, svc) -> {
                String svcNodeId = serviceId.apply(svc.getMetadata().getUid());
                Map<String, String> selector = svc.getSpec().getSelector();
                if (selector != null) {
                    pods.forEach((podName, pod) -> {
                        Map<String, String> labels = pod.getMetadata().getLabels();
                        if (labels != null && labels.entrySet().containsAll(selector.entrySet())) {
                            String podNodeId = podId.apply(pod.getMetadata().getUid());
                            edges.add(new TopologyEdge(svcNodeId, podNodeId));
                        }
                    });
                }
            });

            // 2. Deployment -> ReplicaSet (deployment owns replicasets)
            replicaSets.forEach((rsName, rs) -> {
                String rsNodeId = rsId.apply(rs.getMetadata().getUid());
                OwnerReference owner = findOwnerReference(rs.getMetadata().getOwnerReferences(), "Deployment");
                if (owner != null) {
                    deployments.forEach((depName, dep) -> {
                        if (dep.getMetadata().getUid().equals(owner.getUid())) {
                            String depNodeId = deploymentId.apply(dep.getMetadata().getUid());
                            edges.add(new TopologyEdge(depNodeId, rsNodeId));
                        }
                    });
                }
            });

            // 3. ReplicaSet -> Pod (replicaset owns pods)
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());
                OwnerReference owner = findOwnerReference(pod.getMetadata().getOwnerReferences(), "ReplicaSet");
                if (owner != null) {
                    replicaSets.forEach((rsName, rs) -> {
                        if (rs.getMetadata().getUid().equals(owner.getUid())) {
                            String rsNodeId = rsId.apply(rs.getMetadata().getUid());
                            edges.add(new TopologyEdge(rsNodeId, podNodeId));
                        }
                    });
                }
            });

            // 4. Pod -> ConfigMap (via volumes or envFrom)
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());

                // Check volumes
                if (pod.getSpec() != null && pod.getSpec().getVolumes() != null) {
                    for (Volume vol : pod.getSpec().getVolumes()) {
                        if (vol.getConfigMap() != null) {
                            String cmName = vol.getConfigMap().getName();
                            configMaps.forEach((cmNameKey, cm) -> {
                                if (cmNameKey.equals(cmName)) {
                                    String cmNodeId = cmId.apply(cm.getMetadata().getUid());
                                    edges.add(new TopologyEdge(podNodeId, cmNodeId));
                                }
                            });
                        }
                    }
                }

                // Check envFrom configMaps
                if (pod.getSpec() != null && pod.getSpec().getContainers() != null) {
                    for (Container container : pod.getSpec().getContainers()) {
                        if (container.getEnvFrom() != null) {
                            for (EnvFromSource envFrom : container.getEnvFrom()) {
                                if (envFrom.getConfigMapRef() != null) {
                                    String cmName = envFrom.getConfigMapRef().getName();
                                    configMaps.forEach((cmNameKey, cm) -> {
                                        if (cmNameKey.equals(cmName)) {
                                            String cmNodeId = cmId.apply(cm.getMetadata().getUid());
                                            edges.add(new TopologyEdge(podNodeId, cmNodeId));
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            });

            // 5. Pod -> Secret (via volumes or envFrom)
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());

                // Volumes
                if (pod.getSpec() != null && pod.getSpec().getVolumes() != null) {
                    for (Volume vol : pod.getSpec().getVolumes()) {
                        if (vol.getSecret() != null) {
                            String secretName = vol.getSecret().getSecretName();
                            secrets.forEach((secretNameKey, sec) -> {
                                if (secretNameKey.equals(secretName)) {
                                    String secretNodeId = secretId.apply(sec.getMetadata().getUid());
                                    edges.add(new TopologyEdge(podNodeId, secretNodeId));
                                }
                            });
                        }
                    }
                }

                // EnvFrom secrets
                if (pod.getSpec() != null && pod.getSpec().getContainers() != null) {
                    for (Container container : pod.getSpec().getContainers()) {
                        if (container.getEnvFrom() != null) {
                            for (EnvFromSource envFrom : container.getEnvFrom()) {
                                if (envFrom.getSecretRef() != null) {
                                    String secretName = envFrom.getSecretRef().getName();
                                    secrets.forEach((secretNameKey, sec) -> {
                                        if (secretNameKey.equals(secretName)) {
                                            String secretNodeId = secretId.apply(sec.getMetadata().getUid());
                                            edges.add(new TopologyEdge(podNodeId, secretNodeId));
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            });

            // 6. Ingress -> Service (via ingress backend serviceName)
            ingresses.forEach((ingName, ing) -> {
                String ingNodeId = ingressId.apply(ing.getMetadata().getUid());
                if (ing.getSpec() != null && ing.getSpec().getRules() != null) {
                    ing.getSpec().getRules().forEach(rule -> {
                        if (rule.getHttp() != null && rule.getHttp().getPaths() != null) {
                            rule.getHttp().getPaths().forEach(path -> {
                                if (path.getBackend() != null && path.getBackend().getService() != null) {
                                    String backendSvcName = path.getBackend().getService().getName();
                                    io.fabric8.kubernetes.api.model.Service svc = services.get(backendSvcName);
                                    if (svc != null) {
                                        String svcNodeId = serviceId.apply(svc.getMetadata().getUid());
                                        edges.add(new TopologyEdge(ingNodeId, svcNodeId));
                                    }
                                }
                            });
                        }
                    });
                }
            });

            nsGraph.setNodes(new ArrayList<>(nodes.values()));
            nsGraph.setEdges(edges);
            nsGraphs.put(namespace, nsGraph);
        }

        return new NamespacedGraphResponse(nsGraphs);
    }

    // Helper method to find owner reference by kind
    private OwnerReference findOwnerReference(List<OwnerReference> owners, String kind) {
        if (owners == null) return null;
        for (OwnerReference owner : owners) {
            if (kind.equals(owner.getKind())) {
                return owner;
            }
        }
        return null;
    }
}