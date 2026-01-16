package com.neonpass.application.service;

import com.neonpass.domain.model.User;
import com.neonpass.domain.model.enums.EventStatus;
import com.neonpass.domain.model.enums.UserRole;
import com.neonpass.domain.port.out.*;
import com.neonpass.infrastructure.adapter.in.web.dto.response.AdminDashboardResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de administración.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final OrganizationRepository organizationRepository;
    private final VenueRepository venueRepository;
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;

    public AdminDashboardResponse getDashboard() {
        log.info("Generating admin dashboard");

        // Contadores básicos
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long adminCount = allUsers.stream().filter(u -> UserRole.ADMIN.equals(u.getRole())).count();
        long staffCount = allUsers.stream().filter(u -> UserRole.STAFF.equals(u.getRole())).count();
        long userCount = allUsers.stream().filter(u -> UserRole.USER.equals(u.getRole())).count();

        var allEvents = eventRepository.findAll();
        long publishedEvents = allEvents.stream().filter(e -> EventStatus.PUBLISHED.equals(e.getStatus())).count();
        long draftEvents = allEvents.stream().filter(e -> EventStatus.DRAFT.equals(e.getStatus())).count();

        var allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal platformFees = allOrders.stream()
                .map(o -> o.getPlatformFee() != null ? o.getPlatformFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var allTickets = ticketRepository.findAll();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalEvents((long) allEvents.size())
                .totalOrganizations((long) organizationRepository.findAll().size())
                .totalVenues((long) venueRepository.findAll().size())
                .totalOrders((long) allOrders.size())
                .totalTickets((long) allTickets.size())
                .publishedEvents(publishedEvents)
                .draftEvents(draftEvents)
                .totalRevenue(totalRevenue)
                .platformFees(platformFees)
                .adminCount(adminCount)
                .staffCount(staffCount)
                .userCount(userCount)
                .build();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(UUID userId) {
        return userRepository.findById(userId);
    }

    @Transactional
    public User changeUserRole(UUID userId, UserRole newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        log.info("Changing role of user {} from {} to {}", userId, user.getRole(), newRole);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    @Transactional
    public void deactivateUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        log.info("Deactivating user: {}", userId);
        user.setDeleted(true);
        userRepository.save(user);
    }
}
