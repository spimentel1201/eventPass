package com.neonpass.infrastructure.adapter.out.persistence.adapter;

import com.neonpass.domain.model.Payment;
import com.neonpass.domain.model.enums.PaymentStatus;
import com.neonpass.domain.port.out.PaymentRepository;
import com.neonpass.infrastructure.adapter.out.persistence.mapper.PaymentMapper;
import com.neonpass.infrastructure.adapter.out.persistence.repository.JpaPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter that implements PaymentRepository port.
 */
@Component
@RequiredArgsConstructor
public class PaymentPersistenceAdapter implements PaymentRepository {

    private final JpaPaymentRepository jpaPaymentRepository;
    private final PaymentMapper paymentMapper;

    @Override
    public Payment save(Payment payment) {
        var entity = paymentMapper.toEntity(payment);
        var saved = jpaPaymentRepository.save(entity);
        return paymentMapper.toDomain(saved);
    }

    @Override
    public Optional<Payment> findById(UUID id) {
        return jpaPaymentRepository.findById(id)
                .map(paymentMapper::toDomain);
    }

    @Override
    public Optional<Payment> findByExternalPaymentId(String externalPaymentId) {
        return jpaPaymentRepository.findByExternalPaymentId(externalPaymentId)
                .map(paymentMapper::toDomain);
    }

    @Override
    public Optional<Payment> findByOrderId(UUID orderId) {
        return jpaPaymentRepository.findByOrderId(orderId)
                .map(paymentMapper::toDomain);
    }

    @Override
    public List<Payment> findByUserId(UUID userId) {
        return jpaPaymentRepository.findByUserId(userId).stream()
                .map(paymentMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Payment> findByStatus(PaymentStatus status) {
        return jpaPaymentRepository.findByStatus(status).stream()
                .map(paymentMapper::toDomain)
                .collect(Collectors.toList());
    }
}
