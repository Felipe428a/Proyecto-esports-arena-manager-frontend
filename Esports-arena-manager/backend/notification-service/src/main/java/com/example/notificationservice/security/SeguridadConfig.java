package com.example.notificationservice.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

/**
 * Reglas de acceso de notification-service. Se revisan de arriba hacia abajo: gana la primera que coincide.
 * Sin token, toda regla que no sea permitAll() responde 401; con token pero sin el rol, 403.
 */
@Configuration
public class SeguridadConfig {
    private static final String[] RUTAS_PUBLICAS = {
            "/error", "/doc/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html",
            "/actuator/health/**", "/actuator/info"
    };

    @Bean
    SecurityFilterChain filtros(HttpSecurity http, JwtFiltro jwtFiltro) throws Exception {
        configurarErrores(http);
        return http
                .csrf(csrf -> csrf.disable())          // API REST sin cookies: no necesita CSRF
                .cors(cors -> cors.disable())          // CORS lo resuelve el API Gateway (único origen público)
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                .requestMatchers(RUTAS_PUBLICAS).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/notificaciones").hasAnyRole("ORGANIZADOR", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/notificaciones/{id}").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/v1/notificaciones/**").authenticated()
                .anyRequest().authenticated())
                .addFilterBefore(jwtFiltro, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    /** Respuestas 401 y 403 en JSON, con el mismo formato { "mensaje": ... } que el resto de la API. */
    private void configurarErrores(HttpSecurity http) throws Exception {
        http.exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> responder(res, 401, "Sesión no válida o vencida"))
                .accessDeniedHandler((req, res, ex) -> responder(res, 403, "Sin permiso para esta acción")));
    }

    private static void responder(HttpServletResponse res, int estado, String mensaje) throws IOException {
        res.setStatus(estado);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"status\": " + estado + ", \"mensaje\": \"" + mensaje + "\"}");
    }

    /** No hay usuarios en memoria: la identidad llega siempre en el JWT. */
    @Bean
    UserDetailsService sinUsuariosLocales() {
        return username -> { throw new UsernameNotFoundException(username); };
    }
}
