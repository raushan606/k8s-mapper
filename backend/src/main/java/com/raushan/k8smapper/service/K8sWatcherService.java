package com.raushan.k8smapper.service;

import com.raushan.k8smapper.model.ResourceType;
import com.raushan.k8smapper.websocket.TopologyWebSocketPublisher;
import io.fabric8.kubernetes.client.*;
import io.fabric8.kubernetes.client.dsl.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.function.BiConsumer;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class K8sWatcherService {

    private final Logger log = Logger.getLogger(K8sWatcherService.class.getName());
    private final K8sTopologyStore topologyStore;
    private final TopologyWebSocketPublisher topologyWebSocketPublisher;

    @PostConstruct
    public void watchAllResources() {
        KubernetesClient client = new KubernetesClientBuilder().build();

        try {
            watchResource(client.pods(), ResourceType.POD, (action, pod) -> {
                String name = pod.getMetadata().getName();
                String namespace = pod.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removePod(namespace, name);
                } else {
                    topologyStore.upsertPod(namespace, name, pod);
                }
            });

            watchResource(client.apps().deployments(), ResourceType.DEPLOYMENT, (action, deploy) -> {
                String name = deploy.getMetadata().getName();
                String namespace = deploy.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeDeployment(namespace, name);
                } else {
                    topologyStore.upsertDeployment(namespace, name, deploy);
                }
            });

            watchResource(client.apps().replicaSets(), ResourceType.REPLICASET, (action, rs) -> {
                String name = rs.getMetadata().getName();
                String namespace = rs.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeReplicaSet(namespace, name);
                } else {
                    topologyStore.upsertReplicaSet(namespace, name, rs);
                }
            });

            watchResource(client.services(), ResourceType.SERVICE, (action, svc) -> {
                String name = svc.getMetadata().getName();
                String namespace = svc.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeService(namespace, name);
                } else {
                    topologyStore.upsertService(namespace, name, svc);
                }
            });

            watchResource(client.network().v1().ingresses(), ResourceType.INGRESS, (action, ing) -> {
                String name = ing.getMetadata().getName();
                String namespace = ing.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeIngress(namespace, name);
                } else {
                    topologyStore.upsertIngress(namespace, name, ing);
                }
            });

            watchResource(client.configMaps(), ResourceType.CONFIGMAP, (action, cm) -> {
                String name = cm.getMetadata().getName();
                String namespace = cm.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeConfigMap(namespace, name);
                } else {
                    topologyStore.upsertConfigMap(namespace, name, cm);
                }
            });

            watchResource(client.secrets(), ResourceType.SECRETS, (action, sec) -> {
                String name = sec.getMetadata().getName();
                String namespace = sec.getMetadata().getNamespace();
                if (action == Watcher.Action.DELETED) {
                    topologyStore.removeSecret(namespace, name);
                } else {
                    topologyStore.upsertSecret(namespace, name, sec);
                }
            });
        } catch (Exception e) {
            log.severe("Error while setting up resource watchers: " + e.getMessage());
        } finally {
            client.close();
        }
    }

    private <T> void watchResource(MixedOperation<T, ?, ?> resourceClient, ResourceType resourceType,
                                   BiConsumer<Watcher.Action, T> handler) {
        resourceClient.watch(new Watcher<>() {
            @Override
            public void eventReceived(Action action, T resource) {
                try {
                    handler.accept(action, resource);
                    topologyWebSocketPublisher.publishGraph(topologyStore);
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
}
