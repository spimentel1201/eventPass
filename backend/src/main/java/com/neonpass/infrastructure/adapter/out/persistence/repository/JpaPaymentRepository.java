package com.neonpass.infrastructure.adapter.out.persistence.repository;

import com.neonpass.domain.model.enums.PaymentStatus;
import com.neonpass.infrastructure.adapter.out.persistence.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for payments.
 */
@Repository
public interface JpaPaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    Optional<PaymentEntity> findByExternalPaymentId(String externalPaymentId);

    Optional<PaymentEntity> findByOrderId(UUID orderId);

    List<PaymentEntity> findByUserId(UUID userId);

    List<PaymentEntity> findByStatus(PaymentStatus status);
}
