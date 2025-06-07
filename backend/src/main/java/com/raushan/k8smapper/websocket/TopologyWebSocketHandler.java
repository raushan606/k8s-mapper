package com.raushan.k8smapper.websocket;

import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@RequiredArgsConstructor
public class TopologyWebSocketHandler extends TextWebSocketHandler {

    private final TopologyWebSocketPublisher publisher;
    private WebSocketSession session;

    @Override
    public void afterConnectionEstablished(@NotNull WebSocketSession session) {
        this.session = session;
        publisher.register(this);
    }

    @Override
    public void afterConnectionClosed(@NotNull WebSocketSession session, @NotNull CloseStatus status) {
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
