package com.raushan.k8smapper.service;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.ReplicaSet;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import lombok.Getter;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Getter
@Service
public class K8sTopologyStore {
    private final Map<String, Map<String, Pod>> podsByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Deployment>> deploymentsByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, ReplicaSet>> replicaSetsByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, io.fabric8.kubernetes.api.model.Service>> servicesByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Ingress>> ingressesByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, ConfigMap>> configMapsByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Secret>> secretsByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, PersistentVolumeClaim>> pVCByNamespace = new ConcurrentHashMap<>();
    private final Map<String, Map<String, PersistentVolume>> pVByNamespace = new ConcurrentHashMap<>();

    // Generic upsert helper
    private <T> void upsert(Map<String, Map<String, T>> map, String namespace, String name, T obj) {
        map.computeIfAbsent(namespace, k -> new ConcurrentHashMap<>()).put(name, obj);
    }

    // Generic remove helper
    private <T> void remove(Map<String, Map<String, T>> map, String namespace, String name) {
        Map<String, T> nsMap = map.get(namespace);
        if (nsMap != null) {
            nsMap.remove(name);
            if (nsMap.isEmpty()) {
                map.remove(namespace);
            }
        }
    }

    // Upsert Methods
    public void upsertPod(String namespace, String name, Pod pod) {
        upsert(podsByNamespace, namespace, name, pod);
    }

    public void upsertDeployment(String namespace, String name, Deployment d) {
        upsert(deploymentsByNamespace, namespace, name, d);
    }

    public void upsertReplicaSet(String namespace, String name, ReplicaSet rs) {
        upsert(replicaSetsByNamespace, namespace, name, rs);
    }

    public void upsertService(String namespace, String name, io.fabric8.kubernetes.api.model.Service svc) {
        upsert(servicesByNamespace, namespace, name, svc);
    }

    public void upsertIngress(String namespace, String name, Ingress ing) {
        upsert(ingressesByNamespace, namespace, name, ing);
    }

    public void upsertConfigMap(String namespace, String name, ConfigMap cm) {
        upsert(configMapsByNamespace, namespace, name, cm);
    }

    public void upsertSecret(String namespace, String name, Secret sec) {
        upsert(secretsByNamespace, namespace, name, sec);
    }

    public void upsertPVC(String namespace, String name, PersistentVolumeClaim pvc) {
        upsert(pVCByNamespace, namespace, name, pvc);
    }

    public void upsertPV(String namespace, String name, PersistentVolume pv) {
        upsert(pVByNamespace, namespace, name, pv);
    }

    // Remove Methods
    public void removePod(String namespace, String name) {
        remove(podsByNamespace, namespace, name);
    }

    public void removeDeployment(String namespace, String name) {
        remove(deploymentsByNamespace, namespace, name);
    }

    public void removeReplicaSet(String namespace, String name) {
        remove(replicaSetsByNamespace, namespace, name);
    }

    public void removeService(String namespace, String name) {
        remove(servicesByNamespace, namespace, name);
    }

    public void removeIngress(String namespace, String name) {
        remove(ingressesByNamespace, namespace, name);
    }

    public void removeConfigMap(String namespace, String name) {
        remove(configMapsByNamespace, namespace, name);
    }

    public void removeSecret(String namespace, String name) {
        remove(secretsByNamespace, namespace, name);
    }

    public void removePVC(String namespace, String name) {
        remove(pVCByNamespace, namespace, name);
    }

    public void removePV(String namespace, String name) {
        remove(pVByNamespace, namespace, name);
    }

    // Utility: get all distinct namespaces used
    public Set<String> getNamespaces() {
        return Stream.of(
                podsByNamespace.keySet(),
                deploymentsByNamespace.keySet(),
                replicaSetsByNamespace.keySet(),
                servicesByNamespace.keySet(),
                ingressesByNamespace.keySet(),
                configMapsByNamespace.keySet(),
                secretsByNamespace.keySet(),
                pVCByNamespace.keySet(),
                pVByNamespace.keySet()
        ).flatMap(Set::stream).collect(Collectors.toSet());
    }
}
