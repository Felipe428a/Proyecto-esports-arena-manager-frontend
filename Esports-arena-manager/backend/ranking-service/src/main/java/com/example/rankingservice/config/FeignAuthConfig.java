package com.example.rankingservice.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Cuando este microservicio llama a otro con Feign, reenvía el mismo token que recibió.
 * Así el servicio destino también sabe quién hace la petición y valida sus propias reglas.
 */
@Configuration
public class FeignAuthConfig {
    @Bean
    RequestInterceptor reenviarToken() {
        return plantilla -> {
            if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes atributos) {
                String token = atributos.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                if (token != null && !plantilla.headers().containsKey(HttpHeaders.AUTHORIZATION)) {
                    plantilla.header(HttpHeaders.AUTHORIZATION, token);
                }
            }
        };
    }
}
