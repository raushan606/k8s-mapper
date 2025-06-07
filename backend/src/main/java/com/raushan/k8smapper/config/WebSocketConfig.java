package com.raushan.k8smapper.config;

import com.raushan.k8smapper.service.PodWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new PodWebSocketHandler(), "/ws/pods")
                .setAllowedOrigins("*"); // Allow all origins for simplicity, adjust as needed
    }
}
