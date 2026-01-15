package com.neonpass.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad JPA para la tabla venues.
 */
@Entity
@Table(name = "venues")
@SQLDelete(sql = "UPDATE venues SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(nullable = false)
    private String name;

    private String address;

    @Builder.Default
    private String timezone = "UTC";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "base_layout_json", columnDefinition = "jsonb")
    private String baseLayoutJson;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;
}
