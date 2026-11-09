package com.pedrorlemos.music_studio.model.services;

import com.pedrorlemos.music_studio.model.entities.Appointment;
import com.pedrorlemos.music_studio.model.entities.AppointmentType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AppointmentServiceTest {

    private Appointment appointment(int startHour, int endHour) {
        return new Appointment(
                AppointmentType.GUITAR_LESSON,
                LocalDateTime.of(2026, 10, 30, startHour, 0),
                LocalDateTime.of(2026, 10, 30, endHour, 0),
                "");
    }

    @Test
    void addAppointmentAcceptsFirstAppointment() {
        AppointmentService service = new AppointmentService();

        assertTrue(service.addAppointment(appointment(10, 12)));
    }

    @Test
    void addAppointmentRejectsConflictingAppointment() {
        AppointmentService service = new AppointmentService();
        service.addAppointment(appointment(10, 12));

        assertFalse(service.addAppointment(appointment(11, 13)));
    }

    @Test
    void addAppointmentAcceptsAppointmentThatOnlyTouches() {
        AppointmentService service = new AppointmentService();
        service.addAppointment(appointment(10, 12));

        assertTrue(service.addAppointment(appointment(12, 14)));
    }

    @Test
    void addAppointmentStoresOnlyAcceptedAppointments() {
        AppointmentService service = new AppointmentService();
        service.addAppointment(appointment(10, 12));
        service.addAppointment(appointment(11, 13));
        service.addAppointment(appointment(12, 14));

        assertEquals(2, service.getAppointments().size());
    }
}