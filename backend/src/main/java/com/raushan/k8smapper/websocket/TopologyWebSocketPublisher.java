package com.raushan.k8smapper.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raushan.k8smapper.service.K8sTopologyStore;
import com.raushan.k8smapper.service.TopologyBuilderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
public class TopologyWebSocketPublisher {

    private final K8sTopologyStore topologyStore;
    private final TopologyBuilderService topologyBuilder;
    private final ObjectMapper objectMapper;

    private final CopyOnWriteArraySet<TopologyWebSocketHandler> sessions = new CopyOnWriteArraySet<>();

    public void register(TopologyWebSocketHandler handler) {
        sessions.add(handler);
    }

    public void unregister(TopologyWebSocketHandler handler) {
        sessions.remove(handler);
    }

    // TODO: Uncomment to enable periodic updates
    @Scheduled(fixedRate = 10000)
    public void publishGraph() {
        var graph = topologyBuilder.buildFromStore(topologyStore);

        sessions.forEach(handler -> {
            try {
                String json = objectMapper.writeValueAsString(graph);
                handler.send(json);
            } catch (Exception e) {
                e.getMessage();
            }
        });
    }

    public void publishGraph(K8sTopologyStore store) {
        var graph = topologyBuilder.buildFromStore(store);

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
