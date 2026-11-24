package com.example.resultservice.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger / OpenAPI. Botón "Authorize": pega el token del login para probar los endpoints protegidos.
 * El servidor "/" hace que "Try it out" use el mismo origen desde donde se abrió Swagger
 * (el microservicio directo o el API Gateway).
 */
@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("result-service API")
                        .version("2.0.0")
                        .description("Documentacion OpenAPI para resultados, puntajes y validaciones. Endpoints protegidos con JWT (Bearer)."))
                .servers(List.of(new Server().url("/").description("Origen actual")))
                .components(new Components().addSecuritySchemes("bearerAuth",
                        new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
