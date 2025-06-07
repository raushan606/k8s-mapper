package com.raushan.k8smapper.config;

import com.raushan.k8smapper.websocket.TopologyWebSocketHandler;
import com.raushan.k8smapper.websocket.TopologyWebSocketPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final TopologyWebSocketPublisher publisher;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new TopologyWebSocketHandler(publisher), "/ws/topology")
                .setAllowedOrigins("*");
    }
}
