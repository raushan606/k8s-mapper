package com.raushan.k8smapper.service;

import com.raushan.k8smapper.model.NamespaceGraph;
import com.raushan.k8smapper.model.NamespacedGraphResponse;
import com.raushan.k8smapper.model.ResourceType;
import com.raushan.k8smapper.model.TopologyEdge;
import com.raushan.k8smapper.model.TopologyNode;
import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.EnvFromSource;
import io.fabric8.kubernetes.api.model.HasMetadata;
import io.fabric8.kubernetes.api.model.OwnerReference;
import io.fabric8.kubernetes.api.model.PersistentVolume;
import io.fabric8.kubernetes.api.model.PersistentVolumeClaim;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.api.model.Volume;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.ReplicaSet;
import io.fabric8.kubernetes.api.model.networking.v1.HTTPIngressRuleValue;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
            Function<String, String> pvcId = uid -> "pvc:" + uid;
            Function<String, String> pvId = uid -> "pv:" + uid;

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

            // PersistentVolumeClaims
            Map<String, PersistentVolumeClaim> pvcs = store.getPVCByNamespace().getOrDefault(namespace, Collections.emptyMap());
            pvcs.forEach((name, pvc) -> {
                String id = pvcId.apply(pvc.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.PVC));
            });

            // PersistentVolumes
            Map<String, PersistentVolume> pvs = store.getPVByNamespace().getOrDefault(namespace, Collections.emptyMap());
            pvs.forEach((name, pv) -> {
                String id = pvId.apply(pv.getMetadata().getUid());
                nodes.put(id, new TopologyNode(id, name, namespace, ResourceType.PV));
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
                            edges.add(new TopologyEdge(svcNodeId, podNodeId)); // Dashed edge
                        }
                    });
                }
            });

            // 2. Deployment -> ReplicaSet (via ownerReference)
            replicaSets.forEach((rsName, rs) -> {
                String rsNodeId = rsId.apply(rs.getMetadata().getUid());
                OwnerReference owner = findOwnerReference(rs.getMetadata().getOwnerReferences(), "Deployment");
                if (owner != null) {
                    deployments.forEach((depName, dep) -> {
                        if (dep.getMetadata().getUid().equals(owner.getUid())) {
                            String depNodeId = deploymentId.apply(dep.getMetadata().getUid());
                            edges.add(new TopologyEdge(depNodeId, rsNodeId)); // Solid edge
                        }
                    });
                }
            });

            // 3. ReplicaSet -> Pod (via ownerReference)
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());
                OwnerReference owner = findOwnerReference(pod.getMetadata().getOwnerReferences(), "ReplicaSet");
                if (owner != null) {
                    replicaSets.forEach((rsName, rs) -> {
                        if (rs.getMetadata().getUid().equals(owner.getUid())) {
                            String rsNodeId = rsId.apply(rs.getMetadata().getUid());
                            edges.add(new TopologyEdge(rsNodeId, podNodeId)); // Solid edge
                        }
                    });
                }
            });

            // 4. Deployment -> Pod (derived path via RS)
            deployments.forEach((depName, dep) -> {
                String depNodeId = deploymentId.apply(dep.getMetadata().getUid());
                pods.forEach((podName, pod) -> {
                    OwnerReference rsOwner = findOwnerReference(pod.getMetadata().getOwnerReferences(), "ReplicaSet");
                    if (rsOwner != null) {
                        replicaSets.forEach((rsName, rs) -> {
                            OwnerReference depOwner = findOwnerReference(rs.getMetadata().getOwnerReferences(), "Deployment");
                            if (depOwner != null && depOwner.getUid().equals(dep.getMetadata().getUid())
                                    && rs.getMetadata().getUid().equals(rsOwner.getUid())) {
                                String podNodeId = podId.apply(pod.getMetadata().getUid());
                                edges.add(new TopologyEdge(depNodeId, podNodeId)); // Dashed (derived)
                            }
                        });
                    }
                });
            });

            // 5. Pod -> ConfigMap
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());

                if (pod.getSpec() != null) {
                    // From volumes
                    Optional.ofNullable(pod.getSpec().getVolumes()).ifPresent(volumes -> {
                        for (Volume vol : volumes) {
                            if (vol.getConfigMap() != null) {
                                String cmName = vol.getConfigMap().getName();
                                addEdgeIfExists(cmName, configMaps, cmId, edges, podNodeId);
                            }
                        }
                    });

                    // From envFrom
                    Optional.ofNullable(pod.getSpec().getContainers()).ifPresent(containers -> {
                        for (Container container : containers) {
                            Optional.ofNullable(container.getEnvFrom()).ifPresent(envSources -> {
                                for (EnvFromSource envFrom : envSources) {
                                    if (envFrom.getConfigMapRef() != null) {
                                        String cmName = envFrom.getConfigMapRef().getName();
                                        addEdgeIfExists(cmName, configMaps, cmId, edges, podNodeId);
                                    }
                                }
                            });
                        }
                    });
                }
            });

            // 6. Pod -> Secret
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());

                if (pod.getSpec() != null) {
                    Optional.ofNullable(pod.getSpec().getVolumes()).ifPresent(volumes -> {
                        for (Volume vol : volumes) {
                            if (vol.getSecret() != null) {
                                String secretName = vol.getSecret().getSecretName();
                                addEdgeIfExists(secretName, secrets, secretId, edges, podNodeId);
                            }
                        }
                    });

                    Optional.ofNullable(pod.getSpec().getContainers()).ifPresent(containers -> {
                        for (Container container : containers) {
                            Optional.ofNullable(container.getEnvFrom()).ifPresent(envSources -> {
                                for (EnvFromSource envFrom : envSources) {
                                    if (envFrom.getSecretRef() != null) {
                                        String secretName = envFrom.getSecretRef().getName();
                                        addEdgeIfExists(secretName, secrets, secretId, edges, podNodeId);
                                    }
                                }
                            });
                        }
                    });
                }
            });

            // 7. Ingress -> Service
            ingresses.forEach((ingName, ing) -> {
                String ingNodeId = ingressId.apply(ing.getMetadata().getUid());
                Optional.ofNullable(ing.getSpec().getRules()).ifPresent(rules -> {
                    rules.forEach(rule -> {
                        Optional.ofNullable(rule.getHttp()).map(HTTPIngressRuleValue::getPaths).ifPresent(paths -> {
                            paths.forEach(path -> {
                                if (path.getBackend() != null && path.getBackend().getService() != null) {
                                    String svcName = path.getBackend().getService().getName();
                                    addEdgeIfExists(svcName, services, serviceId, edges, ingNodeId);
                                }
                            });
                        });
                    });
                });
            });

            // 8. Pod -> PVC
            pods.forEach((podName, pod) -> {
                String podNodeId = podId.apply(pod.getMetadata().getUid());
                Optional.ofNullable(pod.getSpec().getVolumes()).ifPresent(volumes -> {
                    for (Volume vol : volumes) {
                        if (vol.getPersistentVolumeClaim() != null) {
                            String pvcName = vol.getPersistentVolumeClaim().getClaimName();
                            addEdgeIfExists(pvcName, pvcs, pvcId, edges, podNodeId);
                        }
                    }
                });
            });

            // 9. PVC -> PV
            pvcs.forEach((pvcName, pvc) -> {
                String pvcNodeId = pvcId.apply(pvc.getMetadata().getUid());
                String volumeName = pvc.getSpec().getVolumeName();
                if (volumeName != null) {
                    PersistentVolume pv = pvs.get(volumeName);
                    if (pv != null) {
                        String pvNodeId = pvId.apply(pv.getMetadata().getUid());
                        edges.add(new TopologyEdge(pvcNodeId, pvNodeId)); // Solid edge
                    }
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

    private <T> void addEdgeIfExists(String name, Map<String, T> resources, Function<String, String> idFn,
                                     List<TopologyEdge> edges, String fromNodeId) {
        T target = resources.get(name);
        if (target != null) {
            String toNodeId = idFn.apply(((HasMetadata) target).getMetadata().getUid());
            edges.add(new TopologyEdge(fromNodeId, toNodeId));
        }
    }
}