package com.raushan.k8smapper.service;

import io.fabric8.kubernetes.client.*;
import io.fabric8.kubernetes.client.dsl.*;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.logging.Logger;

@Service
public class K8sWatcherService {

    private final Logger log = Logger.getLogger(K8sWatcherService.class.getName());
    private final K8sTopologyStore topologyStore = new K8sTopologyStore();

    @PostConstruct
    public void watchAllResources() {
        KubernetesClient client = new KubernetesClientBuilder().build();

        try {
            watchResource(client.pods(), "Pod", (action, pod) -> {
                String name = pod.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removePod(name);
                } else {
                    topologyStore.upsertPod(name, pod);
                }
            });

            watchResource(client.apps().deployments(), "Deployment", (action, deploy) -> {
                String name = deploy.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeDeployment(name);
                } else {
                    topologyStore.upsertDeployment(name, deploy);
                }
            });

            watchResource(client.apps().replicaSets(), "ReplicaSet", (action, rs) -> {
                String name = rs.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeReplicaSet(name);
                } else {
                    topologyStore.upsertReplicaSet(name, rs);
                }
            });

            watchResource(client.services(), "Service", (action, svc) -> {
                String name = svc.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeService(name);
                } else {
                    topologyStore.upsertService(name, svc);
                }
            });

            watchResource(client.network().v1().ingresses(), "Ingress", (action, ing) -> {
                String name = ing.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeIngress(name);
                } else {
                    topologyStore.upsertIngress(name, ing);
                }
            });

            watchResource(client.configMaps(), "ConfigMap", (action, cm) -> {
                String name = cm.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeConfigMap(name);
                } else {
                    topologyStore.upsertConfigMap(name, cm);
                }
            });

            watchResource(client.secrets(), "Secret", (action, sec) -> {
                String name = sec.getMetadata().getName();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeSecret(name);
                } else {
                    topologyStore.upsertSecret(name, sec);
                }
            });
        } catch (Exception e) {
            log.severe("Error while setting up resource watchers: " + e.getMessage());
        } finally {
            client.close();
        }
    }

    private <T> void watchResource(MixedOperation<T, ?, ?> resourceClient, String resourceType, BiConsumer<Watcher.Action, T> handler) {
        resourceClient.watch(new Watcher<>() {
            @Override
            public void eventReceived(Action action, T resource) {
                try {
                    handler.accept(action, resource);
                    log.info(resourceType + " " + action + " event processed for: " + resource);
                } catch (Exception e) {
                    log.severe("Error processing " + resourceType + " event: " + e.getMessage());
                }
            }

            @Override
            public void onClose(WatcherException cause) {
                if (cause != null) {
                    log.severe("Watcher closed due to error: " + cause.getMessage());
                } else {
                    log.info("Watcher closed gracefully for resource type: " + resourceType);
                }
            }
        });
    }

    public K8sTopologyStore getTopologyStore() {
        return topologyStore;
    }
}
