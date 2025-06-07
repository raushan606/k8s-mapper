package com.raushan.k8smapper.service;

import io.fabric8.kubernetes.api.model.ConfigMap;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Secret;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.ReplicaSet;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import lombok.Getter;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Service
public class K8sTopologyStore {
    private final Map<String, Pod> pods = new ConcurrentHashMap<>();
    private final Map<String, Deployment> deployments = new ConcurrentHashMap<>();
    private final Map<String, ReplicaSet> replicaSets = new ConcurrentHashMap<>();
    private final Map<String, io.fabric8.kubernetes.api.model.Service> services = new ConcurrentHashMap<>();
    private final Map<String, Ingress> ingresses = new ConcurrentHashMap<>();
    private final Map<String, ConfigMap> configMaps = new ConcurrentHashMap<>();
    private final Map<String, Secret> secrets = new ConcurrentHashMap<>();

    public void upsertPod(String name, Pod pod) {
        pods.put(name, pod);
    }

    public void removePod(String name) {
        pods.remove(name);
    }

    public void upsertDeployment(String name, Deployment d) {
        deployments.put(name, d);
    }

    public void removeDeployment(String name) {
        deployments.remove(name);
    }

    public void upsertReplicaSet(String name, ReplicaSet rs) {
        replicaSets.put(name, rs);
    }

    public void removeReplicaSet(String name) {
        replicaSets.remove(name);
    }

    public void upsertService(String name, io.fabric8.kubernetes.api.model.Service svc) {
        services.put(name, svc);
    }

    public void removeService(String name) {
        services.remove(name);
    }

    public void upsertIngress(String name, Ingress ing) {
        ingresses.put(name, ing);
    }

    public void removeIngress(String name) {
        ingresses.remove(name);
    }

    public void upsertConfigMap(String name, ConfigMap cm) {
        configMaps.put(name, cm);
    }

    public void removeConfigMap(String name) {
        configMaps.remove(name);
    }

    public void upsertSecret(String name, Secret sec) {
        secrets.put(name, sec);
    }

    public void removeSecret(String name) {
        secrets.remove(name);
    }
}
