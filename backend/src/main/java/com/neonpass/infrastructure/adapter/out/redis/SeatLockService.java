package com.neonpass.infrastructure.adapter.out.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Servicio de bloqueo de asientos usando Redis.
 * 
 * <p>
 * Implementa el patrón de Seat Locking según REDIS_PATTERNS.md:
 * </p>
 * <ul>
 * <li>Key: seat:lock:{eventId}:{seatId}</li>
 * <li>Value: userId</li>
 * <li>TTL: 10 minutos</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeatLockService {

    private final StringRedisTemplate redisTemplate;

    private static final String SEAT_LOCK_PREFIX = "seat:lock:";
    private static final Duration LOCK_TTL = Duration.ofMinutes(10);

    /**
     * Intenta bloquear un asiento para un usuario.
     *
     * @param eventId ID del evento
     * @param seatId  ID del asiento
     * @param userId  ID del usuario que bloquea
     * @return true si el bloqueo fue exitoso, false si ya está bloqueado
     */
    public boolean lockSeat(UUID eventId, UUID seatId, UUID userId) {
        String key = buildKey(eventId, seatId);
        String value = userId.toString();

        // SET NX (solo si no existe) + TTL
        Boolean success = redisTemplate.opsForValue()
                .setIfAbsent(key, value, LOCK_TTL);

        if (Boolean.TRUE.equals(success)) {
            log.info("Asiento bloqueado: {} para usuario: {}", key, userId);
            return true;
        }

        log.warn("Asiento ya bloqueado: {}", key);
        return false;
    }

    /**
     * Libera el bloqueo de un asiento.
     *
     * @param eventId ID del evento
     * @param seatId  ID del asiento
     * @param userId  ID del usuario que libera (debe ser quien bloqueó)
     * @return true si se liberó, false si no era el dueño del bloqueo
     */
    public boolean unlockSeat(UUID eventId, UUID seatId, UUID userId) {
        String key = buildKey(eventId, seatId);
        String currentOwner = redisTemplate.opsForValue().get(key);

        if (currentOwner == null) {
            log.debug("Asiento no estaba bloqueado: {}", key);
            return true;
        }

        if (!currentOwner.equals(userId.toString())) {
            log.warn("Usuario {} no es dueño del bloqueo {}", userId, key);
            return false;
        }

        Boolean deleted = redisTemplate.delete(key);
        log.info("Bloqueo liberado: {}", key);
        return Boolean.TRUE.equals(deleted);
    }

    /**
     * Verifica si un asiento está bloqueado.
     *
     * @return ID del usuario que lo bloqueó, o null si está libre
     */
    public UUID getLockedBy(UUID eventId, UUID seatId) {
        String key = buildKey(eventId, seatId);
        String value = redisTemplate.opsForValue().get(key);

        return value != null ? UUID.fromString(value) : null;
    }

    /**
     * Verifica si el asiento está bloqueado por un usuario específico.
     */
    public boolean isLockedByUser(UUID eventId, UUID seatId, UUID userId) {
        UUID lockedBy = getLockedBy(eventId, seatId);
        return userId.equals(lockedBy);
    }

    /**
     * Extiende el TTL del bloqueo (para mantenerlo durante checkout).
     */
    public boolean extendLock(UUID eventId, UUID seatId, UUID userId) {
        String key = buildKey(eventId, seatId);
        String currentOwner = redisTemplate.opsForValue().get(key);

        if (currentOwner != null && currentOwner.equals(userId.toString())) {
            redisTemplate.expire(key, LOCK_TTL);
            log.debug("TTL extendido para: {}", key);
            return true;
        }

        return false;
    }

    private String buildKey(UUID eventId, UUID seatId) {
        return SEAT_LOCK_PREFIX + eventId + ":" + seatId;
    }
}
