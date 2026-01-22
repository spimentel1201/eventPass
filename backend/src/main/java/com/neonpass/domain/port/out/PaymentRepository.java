package com.neonpass.domain.port.out;

import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Port for Payment persistence operations.
 */
public interface PaymentRepository {

    Payment save(Payment payment);

    Optional<Payment> findById(UUID id);

    Optional<Payment> findByExternalPaymentId(String externalPaymentId);

    Optional<Payment> findByOrderId(UUID orderId);

    List<Payment> findByUserId(UUID userId);

    List<Payment> findByStatus(PaymentStatus status);
}
