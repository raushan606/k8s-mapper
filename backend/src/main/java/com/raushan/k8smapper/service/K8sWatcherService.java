package com.raushan.k8smapper.service;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import io.fabric8.kubernetes.client.Watcher;
import io.fabric8.kubernetes.client.WatcherException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class K8sWatcherService {

    private final Logger log = Logger.getLogger(K8sWatcherService.class.getName());

    private KubernetesClient client;

    @PostConstruct
    public void watchPods() {
        try {
            client = new KubernetesClientBuilder().build();
            log.info("Started Kubernetes watcher...");

            client.pods().inAnyNamespace().watch(new Watcher<>() {
                @Override
                public void eventReceived(Action action, Pod resource) {
                    String podName = resource.getMetadata().getName();
                    String message = action.name() + " -> " + podName;
                    log.info("Received event: " + action.name() + " for pod: " + podName);

                    // Broadcast the event to all WebSocket sessions
                    PodWebSocketHandler.broadcast(message);
                }

                @Override
                public void onClose(WatcherException cause) {
                    log.warning("Watcher closed: " + (cause != null ? cause.getMessage() : "null"));
                }
            });

        } catch (Exception e) {
            log.severe("Error creating Kubernetes client: " + e.getMessage());
        }
    }
}