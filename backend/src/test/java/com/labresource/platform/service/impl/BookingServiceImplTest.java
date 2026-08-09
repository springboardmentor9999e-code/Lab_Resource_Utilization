package com.labresource.platform.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.labresource.platform.dto.BookingResponse;
import com.labresource.platform.dto.CreateBookingRequest;
import com.labresource.platform.dto.RejectBookingRequest;
import com.labresource.platform.entity.Booking;
import com.labresource.platform.entity.BookingStatus;
import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import com.labresource.platform.entity.Role;
import com.labresource.platform.entity.User;
import com.labresource.platform.exception.BookingAvailabilityException;
import com.labresource.platform.exception.EquipmentNotFoundException;
import com.labresource.platform.repository.BookingRepository;
import com.labresource.platform.repository.EquipmentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EquipmentRepository equipmentRepository;

    @Captor
    private ArgumentCaptor<Booking> bookingCaptor;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createBookingUsesAuthenticatedUserAndReturnsPendingResponse() {
        User user = user(1L, Role.ROLE_STUDENT);
        Equipment equipment = equipment(2L, 5);
        CreateBookingRequest request = createRequest(equipment.getId(), 2);

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));
        when(bookingRepository.saveAndFlush(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId(20L);
            return booking;
        });

        BookingResponse response = bookingService.createBooking(request, authentication(user));

        verify(bookingRepository).saveAndFlush(bookingCaptor.capture());
        Booking savedBooking = bookingCaptor.getValue();

        assertThat(savedBooking.getUser()).isEqualTo(user);
        assertThat(savedBooking.getEquipment()).isEqualTo(equipment);
        assertThat(savedBooking.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.userId()).isEqualTo(user.getId());
        assertThat(response.equipmentId()).isEqualTo(equipment.getId());
        assertThat(response.status()).isEqualTo(BookingStatus.PENDING);
    }

    @Test
    void createBookingRejectsMissingEquipment() {
        CreateBookingRequest request = createRequest(44L, 1);

        when(equipmentRepository.findById(44L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.createBooking(request, authentication(user(1L, Role.ROLE_STUDENT))))
                .isInstanceOf(EquipmentNotFoundException.class)
                .hasMessage("Equipment with id 44 was not found");

        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    @Test
    void createBookingRejectsInvalidStartAndEndTime() {
        Equipment equipment = equipment(2L, 5);
        LocalDateTime startTime = LocalDateTime.now().plusDays(1);
        CreateBookingRequest request = new CreateBookingRequest(
                equipment.getId(),
                1,
                startTime,
                startTime,
                "PCR analysis"
        );

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));

        assertThatThrownBy(() -> bookingService.createBooking(request, authentication(user(1L, Role.ROLE_STUDENT))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Start time must be before end time");

        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    @Test
    void createBookingRejectsQuantityGreaterThanEquipmentQuantity() {
        Equipment equipment = equipment(2L, 2);
        CreateBookingRequest request = createRequest(equipment.getId(), 3);

        when(equipmentRepository.findById(equipment.getId())).thenReturn(Optional.of(equipment));

        assertThatThrownBy(() -> bookingService.createBooking(request, authentication(user(1L, Role.ROLE_STUDENT))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Quantity must not be greater than equipment quantity");

        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    @Test
    void approveBookingApprovesPendingBookingWhenQuantityIsAvailable() {
        Booking booking = booking(user(1L, Role.ROLE_STUDENT), equipment(2L, 5), BookingStatus.PENDING, 2);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.findOverlappingByEquipmentIdAndStatus(
                booking.getEquipment().getId(),
                BookingStatus.APPROVED,
                booking.getStartTime(),
                booking.getEndTime()
        )).thenReturn(List.of());
        when(bookingRepository.saveAndFlush(booking)).thenReturn(booking);

        BookingResponse response = bookingService.approveBooking(booking.getId());

        assertThat(response.status()).isEqualTo(BookingStatus.APPROVED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.APPROVED);
    }

    @Test
    void approveBookingRejectsOverlappingApprovedReservationsWhenQuantityIsUnavailable() {
        Equipment equipment = equipment(2L, 5);
        Booking booking = booking(user(1L, Role.ROLE_STUDENT), equipment, BookingStatus.PENDING, 4);
        Booking overlappingBooking = booking(user(3L, Role.ROLE_STUDENT), equipment, BookingStatus.APPROVED, 2);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.findOverlappingByEquipmentIdAndStatus(
                equipment.getId(),
                BookingStatus.APPROVED,
                booking.getStartTime(),
                booking.getEndTime()
        )).thenReturn(List.of(overlappingBooking));

        assertThatThrownBy(() -> bookingService.approveBooking(booking.getId()))
                .isInstanceOf(BookingAvailabilityException.class)
                .hasMessage("Insufficient equipment quantity available for the requested time range");

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.PENDING);
        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    @Test
    void approveBookingAllowsNonOverlappingBookings() {
        Booking booking = booking(user(1L, Role.ROLE_STUDENT), equipment(2L, 5), BookingStatus.PENDING, 5);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.findOverlappingByEquipmentIdAndStatus(
                booking.getEquipment().getId(),
                BookingStatus.APPROVED,
                booking.getStartTime(),
                booking.getEndTime()
        )).thenReturn(List.of());
        when(bookingRepository.saveAndFlush(booking)).thenReturn(booking);

        BookingResponse response = bookingService.approveBooking(booking.getId());

        assertThat(response.status()).isEqualTo(BookingStatus.APPROVED);
    }

    @Test
    void rejectBookingRejectsPendingBookingWithReason() {
        Booking booking = booking(user(1L, Role.ROLE_STUDENT), equipment(2L, 5), BookingStatus.PENDING, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.saveAndFlush(booking)).thenReturn(booking);

        BookingResponse response = bookingService.rejectBooking(
                booking.getId(),
                new RejectBookingRequest("  Equipment unavailable  ")
        );

        assertThat(response.status()).isEqualTo(BookingStatus.REJECTED);
        assertThat(response.rejectionReason()).isEqualTo("Equipment unavailable");
    }

    @Test
    void cancelBookingAllowsOwnerToCancelBooking() {
        User user = user(1L, Role.ROLE_STUDENT);
        Booking booking = booking(user, equipment(2L, 5), BookingStatus.APPROVED, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.saveAndFlush(booking)).thenReturn(booking);

        BookingResponse response = bookingService.cancelBooking(booking.getId(), authentication(user));

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void cancelBookingRejectsNormalUserCancellingAnotherUsersBooking() {
        User owner = user(1L, Role.ROLE_STUDENT);
        User otherUser = user(2L, Role.ROLE_STUDENT);
        Booking booking = booking(owner, equipment(2L, 5), BookingStatus.APPROVED, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getId(), authentication(otherUser)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You cannot cancel this booking");

        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    @Test
    void getBookingByIdRejectsNormalUserViewingAnotherUsersBooking() {
        User owner = user(1L, Role.ROLE_STUDENT);
        User otherUser = user(2L, Role.ROLE_STUDENT);
        Booking booking = booking(owner, equipment(2L, 5), BookingStatus.PENDING, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.getBookingById(booking.getId(), authentication(otherUser)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You cannot access this booking");
    }

    @Test
    void adminCanViewAndCancelAnyBooking() {
        User owner = user(1L, Role.ROLE_STUDENT);
        User admin = user(9L, Role.ROLE_SYSTEM_ADMIN);
        Booking booking = booking(owner, equipment(2L, 5), BookingStatus.APPROVED, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.saveAndFlush(booking)).thenReturn(booking);

        BookingResponse viewedBooking = bookingService.getBookingById(booking.getId(), authentication(admin));
        BookingResponse cancelledBooking = bookingService.cancelBooking(booking.getId(), authentication(admin));

        assertThat(viewedBooking.id()).isEqualTo(booking.getId());
        assertThat(cancelledBooking.status()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void labAssistantCanViewAndCancelAnyBooking() {
        User owner = user(1L, Role.ROLE_STUDENT);
        User labAssistant = user(9L, Role.ROLE_LAB_ASSISTANT);
        Booking booking = booking(owner, equipment(2L, 5), BookingStatus.APPROVED, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.saveAndFlush(booking)).thenReturn(booking);

        BookingResponse viewedBooking = bookingService.getBookingById(booking.getId(), authentication(labAssistant));
        BookingResponse cancelledBooking = bookingService.cancelBooking(booking.getId(), authentication(labAssistant));

        assertThat(viewedBooking.id()).isEqualTo(booking.getId());
        assertThat(cancelledBooking.status()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    void hodCanViewAnyBookingButCannotCancelBookings() {
        User owner = user(1L, Role.ROLE_STUDENT);
        User hod = user(9L, Role.ROLE_HOD);
        Booking booking = booking(owner, equipment(2L, 5), BookingStatus.APPROVED, 1);

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        BookingResponse viewedBooking = bookingService.getBookingById(booking.getId(), authentication(hod));

        assertThat(viewedBooking.id()).isEqualTo(booking.getId());
        assertThatThrownBy(() -> bookingService.cancelBooking(booking.getId(), authentication(hod)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You cannot cancel this booking");

        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    @Test
    void labAssistantCannotCreateBookings() {
        Equipment equipment = equipment(2L, 5);
        CreateBookingRequest request = createRequest(equipment.getId(), 1);

        assertThatThrownBy(() -> bookingService.createBooking(request, authentication(user(1L, Role.ROLE_LAB_ASSISTANT))))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You cannot create bookings");

        verify(equipmentRepository, never()).findById(any(Long.class));
        verify(bookingRepository, never()).saveAndFlush(any(Booking.class));
    }

    private CreateBookingRequest createRequest(Long equipmentId, Integer quantity) {
        return new CreateBookingRequest(
                equipmentId,
                quantity,
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(1).plusHours(2),
                "PCR analysis"
        );
    }

    private Authentication authentication(User user) {
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

    private User user(Long id, Role role) {
        return User.builder()
                .id(id)
                .firstName("Test")
                .lastName("User")
                .email("user" + id + "@example.com")
                .password("encoded-password")
                .role(role)
                .enabled(true)
                .build();
    }

    private Equipment equipment(Long id, Integer quantity) {
        return Equipment.builder()
                .id(id)
                .name("Centrifuge")
                .category("Sample Prep")
                .manufacturer("Eppendorf")
                .serialNumber("SN-" + id)
                .quantity(quantity)
                .availableQuantity(quantity)
                .status(EquipmentStatus.AVAILABLE)
                .purchaseDate(LocalDate.of(2024, 2, 10))
                .lab(lab())
                .build();
    }

    private Lab lab() {
        return Lab.builder()
                .id(1L)
                .name("Bio Lab")
                .building("Science Block")
                .roomNumber("204")
                .capacity(30)
                .active(true)
                .build();
    }

    private Booking booking(User user, Equipment equipment, BookingStatus status, Integer quantity) {
        return Booking.builder()
                .id(10L)
                .user(user)
                .equipment(equipment)
                .quantity(quantity)
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .purpose("PCR analysis")
                .status(status)
                .build();
    }
}
