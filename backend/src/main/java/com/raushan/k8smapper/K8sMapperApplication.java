package com.raushan.k8smapper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class K8sMapperApplication {
    public static void main(String[] args) {
        SpringApplication.run(K8sMapperApplication.class, args);
    }
}
