package com.example.tournamentservice.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import feign.FeignException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleStatus(ResponseStatusException ex) {
        return response(HttpStatus.valueOf(ex.getStatusCode().value()), message(ex.getReason(), "Error de dominio"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> fields.put(error.getField(), error.getDefaultMessage()));
        String mensaje = String.join(". ", fields.values());
        return response(HttpStatus.BAD_REQUEST, mensaje.isBlank() ? "Datos invalidos" : mensaje, fields);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(ConstraintViolationException ex) {
        return response(HttpStatus.BAD_REQUEST, "Parametros invalidos", ex.getMessage());
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class, MissingServletRequestParameterException.class})
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
        return response(HttpStatus.BAD_REQUEST, "Solicitud invalida o JSON mal formado", ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return response(HttpStatus.CONFLICT, "Conflicto de integridad de datos", mostSpecific(ex));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleForbidden(AccessDeniedException ex) {
        return response(HttpStatus.FORBIDDEN, "Sin permiso para esta acción");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(AuthenticationException ex) {
        return response(HttpStatus.UNAUTHORIZED, "Sesión no válida o vencida");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoResourceFoundException ex) {
        return response(HttpStatus.NOT_FOUND, "Ruta no encontrada");
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeign(FeignException ex) {
        HttpStatus status = ex.status() == 404 ? HttpStatus.BAD_REQUEST : HttpStatus.BAD_GATEWAY;
        return response(status, ex.status() == 404 ? "Recurso relacionado no encontrado" : "Error al consultar otro microservicio", ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno controlado", ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String error) {
        return response(status, error, null);
    }

    private ResponseEntity<Map<String, Object>> response(HttpStatus status, String error, Object detail) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", error);
        body.put("mensaje", error); // el frontend muestra este texto
        if (detail != null) body.put("detalle", detail);
        return ResponseEntity.status(status).body(body);
    }

    private String message(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String mostSpecific(DataIntegrityViolationException ex) {
        return ex.getMostSpecificCause() == null ? ex.getMessage() : ex.getMostSpecificCause().getMessage();
    }
}
