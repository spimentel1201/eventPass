package com.neonpass.infrastructure.config;

import com.neonpass.domain.model.*;
import com.neonpass.domain.model.enums.*;
import com.neonpass.domain.port.out.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Seeder inicial para datos de prueba.
 * Solo se ejecuta en perfil "dev" o "local".
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile({ "dev", "local", "default" })
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final TicketTierRepository ticketTierRepository;
    private final SectionRepository sectionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Verificar si ya hay datos
        if (userRepository.findByEmail("admin@neonpass.com").isPresent()) {
            log.info("📦 Database already seeded, skipping...");
            return;
        }

        log.info("🌱 Starting database seeding...");

        // ==========================================
        // 1. USERS
        // ==========================================
        User admin = userRepository.save(User.builder()
                .id(UUID.randomUUID())
                .email("admin@neonpass.com")
                .passwordHash(passwordEncoder.encode("Admin123!"))
                .fullName("Admin NeonPass")
                .role(UserRole.ADMIN)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created admin user: {}", admin.getEmail());

        User organizer = userRepository.save(User.builder()
                .id(UUID.randomUUID())
                .email("organizer@example.com")
                .passwordHash(passwordEncoder.encode("Organizer123!"))
                .fullName("Carlos Mendoza")
                .role(UserRole.STAFF)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created organizer user: {}", organizer.getEmail());

        User customer = userRepository.save(User.builder()
                .id(UUID.randomUUID())
                .email("customer@example.com")
                .passwordHash(passwordEncoder.encode("Customer123!"))
                .fullName("María García")
                .role(UserRole.USER)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created customer user: {}", customer.getEmail());

        // ==========================================
        // 2. ORGANIZATIONS
        // ==========================================
        Organization liveNation = organizationRepository.save(Organization.builder()
                .id(UUID.randomUUID())
                .ownerId(organizer.getId())
                .name("Live Nation Perú")
                .slug("live-nation-peru")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created organization: {}", liveNation.getName());

        Organization sportsPromo = organizationRepository.save(Organization.builder()
                .id(UUID.randomUUID())
                .ownerId(organizer.getId())
                .name("Sports Promo Latam")
                .slug("sports-promo")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created organization: {}", sportsPromo.getName());

        Organization theaterGroup = organizationRepository.save(Organization.builder()
                .id(UUID.randomUUID())
                .ownerId(admin.getId())
                .name("Teatro Nacional")
                .slug("teatro-nacional")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created organization: {}", theaterGroup.getName());

        // ==========================================
        // 3. VENUES
        // ==========================================
        Venue estadioNacional = venueRepository.save(Venue.builder()
                .id(UUID.randomUUID())
                .organizationId(sportsPromo.getId())
                .name("Estadio Nacional")
                .address("Av. José Díaz s/n, Lima")
                .timezone("America/Lima")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created venue: {}", estadioNacional.getName());

        Venue arenaPerú = venueRepository.save(Venue.builder()
                .id(UUID.randomUUID())
                .organizationId(liveNation.getId())
                .name("Arena Perú")
                .address("Av. Javier Prado Este 560, San Isidro")
                .timezone("America/Lima")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created venue: {}", arenaPerú.getName());

        Venue teatroMunicipal = venueRepository.save(Venue.builder()
                .id(UUID.randomUUID())
                .organizationId(theaterGroup.getId())
                .name("Gran Teatro Municipal")
                .address("Jr. Huancavelica 265, Cercado de Lima")
                .timezone("America/Lima")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created venue: {}", teatroMunicipal.getName());

        // ==========================================
        // 4. SECTIONS (para cada venue)
        // ==========================================
        Section vipEstadio = sectionRepository.save(Section.builder()
                .id(UUID.randomUUID())
                .venueId(estadioNacional.getId())
                .name("VIP Tribuna Norte")
                .type(SectionType.SEATED)
                .capacity(500)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        Section generalEstadio = sectionRepository.save(Section.builder()
                .id(UUID.randomUUID())
                .venueId(estadioNacional.getId())
                .name("Campo General")
                .type(SectionType.GENERAL)
                .capacity(5000)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        Section vipArena = sectionRepository.save(Section.builder()
                .id(UUID.randomUUID())
                .venueId(arenaPerú.getId())
                .name("Platinum Zone")
                .type(SectionType.SEATED)
                .capacity(200)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        Section generalArena = sectionRepository.save(Section.builder()
                .id(UUID.randomUUID())
                .venueId(arenaPerú.getId())
                .name("General Admission")
                .type(SectionType.GENERAL)
                .capacity(3000)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        Section plateaTeatro = sectionRepository.save(Section.builder()
                .id(UUID.randomUUID())
                .venueId(teatroMunicipal.getId())
                .name("Platea")
                .type(SectionType.SEATED)
                .capacity(300)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        Section balconTeatro = sectionRepository.save(Section.builder()
                .id(UUID.randomUUID())
                .venueId(teatroMunicipal.getId())
                .name("Balcón")
                .type(SectionType.SEATED)
                .capacity(150)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created 6 sections");

        // ==========================================
        // 5. EVENTS
        // ==========================================
        // Concierto
        Event coldplayEvent = eventRepository.save(Event.builder()
                .id(UUID.randomUUID())
                .organizationId(liveNation.getId())
                .venueId(arenaPerú.getId())
                .title("Coldplay - Music of the Spheres World Tour")
                .description(
                        "La banda británica Coldplay regresa a Lima con su espectacular gira mundial. Una experiencia audiovisual única con sus más grandes éxitos.")
                .startTime(LocalDateTime.now().plusMonths(2))
                .endTime(LocalDateTime.now().plusMonths(2).plusHours(3))
                .status(EventStatus.PUBLISHED)
                .metadata("{\"category\":\"concierto\",\"artist\":\"Coldplay\",\"genre\":\"rock alternativo\"}")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created event: {}", coldplayEvent.getTitle());

        // Partido de Fútbol
        Event futbolEvent = eventRepository.save(Event.builder()
                .id(UUID.randomUUID())
                .organizationId(sportsPromo.getId())
                .venueId(estadioNacional.getId())
                .title("Perú vs Argentina - Eliminatorias Sudamericanas")
                .description(
                        "Partido crucial de las eliminatorias rumbo al Mundial. La selección peruana enfrenta a Argentina en un encuentro histórico.")
                .startTime(LocalDateTime.now().plusWeeks(3))
                .endTime(LocalDateTime.now().plusWeeks(3).plusHours(2))
                .status(EventStatus.PUBLISHED)
                .metadata(
                        "{\"category\":\"deporte\",\"sport\":\"fútbol\",\"competition\":\"Eliminatorias Sudamericanas 2026\"}")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created event: {}", futbolEvent.getTitle());

        // Obra de Teatro
        Event teatroEvent = eventRepository.save(Event.builder()
                .id(UUID.randomUUID())
                .organizationId(theaterGroup.getId())
                .venueId(teatroMunicipal.getId())
                .title("El Fantasma de la Ópera - Musical")
                .description(
                        "El clásico musical de Andrew Lloyd Webber llega a Lima. Una producción de primer nivel con elenco internacional.")
                .startTime(LocalDateTime.now().plusMonths(1))
                .endTime(LocalDateTime.now().plusMonths(1).plusHours(3))
                .status(EventStatus.PUBLISHED)
                .metadata("{\"category\":\"teatro\",\"type\":\"musical\",\"audience\":\"todo público\"}")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created event: {}", teatroEvent.getTitle());

        // Festival (evento adicional)
        Event festivalEvent = eventRepository.save(Event.builder()
                .id(UUID.randomUUID())
                .organizationId(liveNation.getId())
                .venueId(estadioNacional.getId())
                .title("Vivo x el Rock 2026")
                .description(
                        "El festival de rock más grande de Latinoamérica. Más de 20 bandas en 2 escenarios durante 12 horas de música.")
                .startTime(LocalDateTime.now().plusMonths(4))
                .endTime(LocalDateTime.now().plusMonths(4).plusHours(12))
                .status(EventStatus.DRAFT)
                .metadata("{\"category\":\"festival\",\"genre\":\"rock\",\"duration\":\"12 horas\"}")
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());
        log.info("✅ Created event: {}", festivalEvent.getTitle());

        // ==========================================
        // 6. TICKET TIERS
        // ==========================================
        // Coldplay tiers
        ticketTierRepository.save(TicketTier.builder()
                .id(UUID.randomUUID())
                .eventId(coldplayEvent.getId())
                .sectionId(vipArena.getId())
                .name("Platinum")
                .price(new BigDecimal("450.00"))
                .currency("USD")
                .capacityAllocated(200)
                .status(TicketTierStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        ticketTierRepository.save(TicketTier.builder()
                .id(UUID.randomUUID())
                .eventId(coldplayEvent.getId())
                .sectionId(generalArena.getId())
                .name("General")
                .price(new BigDecimal("120.00"))
                .currency("USD")
                .capacityAllocated(3000)
                .status(TicketTierStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        // Fútbol tiers
        ticketTierRepository.save(TicketTier.builder()
                .id(UUID.randomUUID())
                .eventId(futbolEvent.getId())
                .sectionId(vipEstadio.getId())
                .name("Tribuna VIP")
                .price(new BigDecimal("250.00"))
                .currency("USD")
                .capacityAllocated(500)
                .status(TicketTierStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        ticketTierRepository.save(TicketTier.builder()
                .id(UUID.randomUUID())
                .eventId(futbolEvent.getId())
                .sectionId(generalEstadio.getId())
                .name("Campo")
                .price(new BigDecimal("80.00"))
                .currency("USD")
                .capacityAllocated(5000)
                .status(TicketTierStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        // Teatro tiers
        ticketTierRepository.save(TicketTier.builder()
                .id(UUID.randomUUID())
                .eventId(teatroEvent.getId())
                .sectionId(plateaTeatro.getId())
                .name("Platea Premium")
                .price(new BigDecimal("180.00"))
                .currency("USD")
                .capacityAllocated(300)
                .status(TicketTierStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        ticketTierRepository.save(TicketTier.builder()
                .id(UUID.randomUUID())
                .eventId(teatroEvent.getId())
                .sectionId(balconTeatro.getId())
                .name("Balcón")
                .price(new BigDecimal("90.00"))
                .currency("USD")
                .capacityAllocated(150)
                .status(TicketTierStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .deleted(false)
                .build());

        log.info("✅ Created 6 ticket tiers");

        log.info("🎉 Database seeding completed successfully!");
        log.info("📋 Summary:");
        log.info("   - 3 Users (admin, organizer, customer)");
        log.info("   - 3 Organizations");
        log.info("   - 3 Venues");
        log.info("   - 6 Sections");
        log.info("   - 4 Events (Concierto, Fútbol, Teatro, Festival)");
        log.info("   - 6 Ticket Tiers");
        log.info("");
        log.info("🔑 Test Credentials:");
        log.info("   Admin: admin@neonpass.com / Admin123!");
        log.info("   Organizer: organizer@example.com / Organizer123!");
        log.info("   Customer: customer@example.com / Customer123!");
    }
}
