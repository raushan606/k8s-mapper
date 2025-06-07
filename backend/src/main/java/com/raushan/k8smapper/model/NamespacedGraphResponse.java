package com.raushan.k8smapper.model;

import java.util.Map;

public record NamespacedGraphResponse(Map<String, NamespaceGraph> namespaces) {
}
