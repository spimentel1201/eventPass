package com.neonpass.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

/**
 * Entidad JPA para la tabla seats.
 */
@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "section_id", "row_label", "number_label" })
})
@SQLDelete(sql = "UPDATE seats SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "section_id")
    private UUID sectionId;

    @Column(name = "row_label", nullable = false)
    private String rowLabel;

    @Column(name = "number_label", nullable = false)
    private String numberLabel;

    @Column(name = "x_position", nullable = false)
    private Integer xPosition;

    @Column(name = "y_position", nullable = false)
    private Integer yPosition;

    @Column(name = "is_accessible")
    @Builder.Default
    private Boolean isAccessible = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean deleted = false;
}
