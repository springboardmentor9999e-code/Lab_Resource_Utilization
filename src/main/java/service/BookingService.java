package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Booking;
import com.example.labresourceplatform.entity.Equipment;
import com.example.labresourceplatform.entity.Notification;
import com.example.labresourceplatform.entity.User;
import com.example.labresourceplatform.model.Role;
import com.example.labresourceplatform.repository.BookingRepository;
import com.example.labresourceplatform.repository.EquipmentRepository;
import com.example.labresourceplatform.repository.NotificationRepository;
import com.example.labresourceplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public Booking saveBooking(Booking booking) {

        Booking savedBooking = bookingRepository.save(booking);

        Equipment equipment = equipmentRepository
                .findById(savedBooking.getEquipment().getId())
                .orElse(null);

        User bookedUser = userRepository
                .findByEmail(savedBooking.getBookedBy())
                .orElse(null);

        if (bookedUser != null &&
                (bookedUser.getRole() == Role.STUDENT
                        || bookedUser.getRole() == Role.RESEARCHER
                        || bookedUser.getRole() == Role.SCIENTIST)) {

            List<User> users = userRepository.findAll();

            for (User user : users) {

                if (user.getRole() == Role.SYSTEM_ADMIN
                        || user.getRole() == Role.DEPARTMENT_HEAD
                        || user.getRole() == Role.LAB_TECHNICIAN) {

                    Notification notification = new Notification();

                    notification.setTitle("New Booking Request");

                    notification.setMessage(
                            bookedUser.getName() + " booked " +
                                    (equipment != null ? equipment.getEquipmentName() : "Equipment")
                    );

                    notification.setReceiverEmail(user.getEmail());
                    notification.setReceiverRole(user.getRole().name());
                    notification.setIsRead(false);

                    notificationRepository.save(notification);
                }
            }
        }

        return savedBooking;
    }

    public Booking updateBooking(Long id, Booking booking) {

        Booking existingBooking = bookingRepository
                .findById(id)
                .orElseThrow();

        existingBooking.setStatus(booking.getStatus());

        Booking updatedBooking = bookingRepository.save(existingBooking);

        Equipment equipment = equipmentRepository
                .findById(existingBooking.getEquipment().getId())
                .orElse(null);

        Notification notification = new Notification();

        notification.setTitle("Booking " + booking.getStatus());

        notification.setMessage(
                "Your booking for "
                        + equipment.getEquipmentName()
                        + " has been "
                        + booking.getStatus()
        );

        notification.setReceiverEmail(existingBooking.getBookedBy());

        notification.setReceiverRole("");

        notificationRepository.save(notification);

        return updatedBooking;
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }
}