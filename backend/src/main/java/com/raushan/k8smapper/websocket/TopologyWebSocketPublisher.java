package com.raushan.k8smapper.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raushan.k8smapper.model.TopologyGraph;
import com.raushan.k8smapper.service.TopologyBuilderService;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.networking.v1.Ingress;
import io.fabric8.kubernetes.client.KubernetesClient;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
public class TopologyWebSocketPublisher {

    private final KubernetesClient client;
    private final TopologyBuilderService topologyBuilder;
    private final ObjectMapper objectMapper;

    private final CopyOnWriteArraySet<TopologyWebSocketHandler> sessions = new CopyOnWriteArraySet<>();

    public void register(TopologyWebSocketHandler handler) {
        sessions.add(handler);
    }

    public void unregister(TopologyWebSocketHandler handler) {
        sessions.remove(handler);
    }

    @Scheduled(fixedRate = 5000)
    public void publishGraph() {
        List<Pod> pods = client.pods().inAnyNamespace().list().getItems();
        List< Service> services = client.services().inAnyNamespace().list().getItems();
        List<Ingress> ingresses = client.network().v1().ingresses().inAnyNamespace().list().getItems();
        TopologyGraph graph = topologyBuilder.buildGraph(pods, services, ingresses);

        sessions.forEach(handler -> {
            try {
                String json = objectMapper.writeValueAsString(graph);
                handler.send(json);
            } catch (Exception e) {
                // ignore failed handlers
            }
        });
    }
}
