package com.raushan.k8smapper.websocket;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.logging.Logger;

@RequiredArgsConstructor
public class TopologyWebSocketHandler extends TextWebSocketHandler {

    private final Logger log = Logger.getLogger(TopologyWebSocketHandler.class.getName());

    private final TopologyWebSocketPublisher publisher;
    private WebSocketSession session;

    @Override
    public void afterConnectionEstablished(@NotNull WebSocketSession session) {
        log.info("WebSocket connection established: " + session.getId());
        this.session = session;
        publisher.register(this);
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, @NotNull CloseStatus status) {
        log.info("WebSocket connection closed: " + session.getId() + ", Status: " + status);
        publisher.unregister(this);
    }

    public void send(String json) {
        try {
            if (session != null && session.isOpen()) {
                session.sendMessage(new TextMessage(json));
            }
        } catch (Exception ignored) {
        }
    }
}
